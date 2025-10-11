import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserStatus } from 'src/common/enums/enum';
import { MailService } from 'src/mail/mail.service';
import { UserService } from './../user/user.service';
import { User } from 'src/user/entities/user.entity';
import { TokenService } from 'src/token/token.service';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { CreateUserDTO } from 'src/user/dto/create-user.dto';
import { UserPayload } from './interfaces/user-payload.interface';
import { AuthorizationService } from './../authorization/authorization.service';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private dataSource: DataSource,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
    private authorizationService: AuthorizationService,
  ) {}

  async login(email: string, password: string) {
    const payload = await this.validate(email, password);

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN'),
      expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN'),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES'),
    });

    await this.tokenService.create(refreshToken, payload.id);

    return { accessToken, refreshToken, user: payload };
  }

  async logout(refreshToken: string) {
    const userPayload: UserPayload = this.jwtService.verify(refreshToken, {
      secret: this.configService.get('REFRESH_TOKEN'),
    });

    return await this.tokenService.removeToken(refreshToken, userPayload.id);
  }

  async validate(email: string, password: string) {
    const user = await this.userService.findByEmail(email, true);

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid Credentials!');
    }

    switch (user.status) {
      case UserStatus.INACTIVE:
        throw new ForbiddenException('Account is inactive!');
      case UserStatus.UNVERIFIED:
        throw new UnauthorizedException('Account is not verified!');
      case UserStatus.PENDING:
        throw new ForbiddenException(
          'Account is pending approval. Please contact the administrator to validate your account.',
        );
    }
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      roles: user.roles,
    };
  }

  async signup(createUserDTO: CreateUserDTO) {
    // Count user in DB
    const userCount = await this.userService.countUser();

    const hashedPassword = await bcrypt.hash(createUserDTO.password, 10);

    // The first account will be admin account
    const userData =
      userCount === 0
        ? {
            ...createUserDTO,
            password: hashedPassword,
            status: UserStatus.ACTIVE,
          }
        : {
            ...createUserDTO,
            password: hashedPassword,
            status: UserStatus.ACTIVE, // Just in develop
            // status: UserStatus.UNVERIFIED,
          };

    const user = await this.userService.create(userData);
    const environment = this.configService.get<string>('environment');

    // Just verify email when account not the first account
    if (environment === 'prod' && userCount !== 0) {
      const backendUrl = this.configService.get<string>('BACKEND_URL');
      const payload = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: user.roles,
      };

      const token = this.jwtService.sign(payload, {
        secret: this.configService.get<string>('VERIFY_EMAIL_TOKEN'),
        expiresIn: this.configService.get<string>('VERIFY_EMAIL_TOKEN_EXPIRES'),
      });

      const verifyLink = `${backendUrl}/users/auth/verify-email?token=${token}`;

      await this.mailService.verifyEmail(user.email, verifyLink);
    }

    const { password, ...result } = user;

    // Assign role to user
    if (userCount === 0) {
      const adminRole =
        await this.authorizationService.findRoleByName('superadmin');
      await this.authorizationService.assignRoleToUser(user.id, adminRole.id);
    }
    return result;
  }

  async verifyEmail(id: number) {
    const user = await this.userService.findOne(id);
    if (!user) throw new NotFoundException('User not found!');

    if (user.status === UserStatus.UNVERIFIED) {
      await this.userService.changeStatus(id, UserStatus.PENDING);
    }
  }

  async refresh(refreshToken?: string) {
    if (!refreshToken)
      throw new UnauthorizedException('Refresh token required!');

    let userPayload: UserPayload;

    try {
      userPayload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('REFRESH_TOKEN'),
      });

      // Check if token exist
      const isTokenExist = await this.tokenService.isTokenExist(
        refreshToken,
        userPayload.id,
      );
      if (!isTokenExist)
        throw new UnauthorizedException('Expired refresh token. Login again!');
    } catch (error) {
      console.log(error);
      throw new UnauthorizedException('Invalid or expired refresh token!');
    }

    const user = await this.userService.findOne(userPayload.id);
    const userRoles = await this.authorizationService.getUserRoles(user.id);

    // Check if token is exist in database
    await this.tokenService.isTokenExist(refreshToken, user.id);

    const accessToken = this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        roles: userRoles.roles.map((role) => role.name),
      },
      {
        secret: this.configService.get('ACCESS_TOKEN'),
        expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES'),
      },
    );

    return accessToken;
  }

  async sendResetPasswordLink(email: string) {
    const user = await this.dataSource
      .createQueryBuilder(User, 'user')
      .where('user.email = :email', { email })
      .andWhere('user.status = :status', { status: UserStatus.ACTIVE })
      .select(['user.id', 'user.email'])
      .getOne();

    if (!user)
      return {
        success: true,
        message: 'Reset link is sent to your email hehe!',
      };

    const payload = { email: user.email, sub: user.id };
    const token = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('RESET_PASSWORD_TOKEN'),
      expiresIn: this.configService.get<string>('RESET_PASSWORD_TOKEN_EXPIRES'),
    });

    const frontendUrl = this.configService.get<string>('FRONTEND_URL');

    const resetPwdLink = `${frontendUrl}/auth/reset-password?token=${token}`;

    await this.mailService.resetPasswordEmail(user.email, resetPwdLink);

    return {
      success: true,
      message: 'Reset link is sent to your email!',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    try {
      const payload: { sub: number; email: string } =
        await this.jwtService.verify(resetPasswordDto.token, {
          secret: this.configService.get<string>('RESET_PASSWORD_TOKEN'),
        });

      await this.userService.resetPassword(
        resetPasswordDto.newPassword,
        payload.sub,
      );

      return { message: 'Reset password success!' };
    } catch (e) {
      throw new Error('Token invalid or expired!');
    }
  }
}
