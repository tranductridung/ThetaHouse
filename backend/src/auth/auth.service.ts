import { ConfigService } from '@nestjs/config';
import { UserService } from './../user/user.service';
import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus } from 'src/common/enums/enum';
import { CreateUserDTO } from 'src/user/dto/create-user.dto';
import { TokenService } from 'src/token/token.service';
import { MailService } from 'src/mail/mail.service';
import { UserOAuthData, UserPayload } from './user-payload.interface';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private tokenService: TokenService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private mailService: MailService,
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

    if (user.status !== UserStatus.ACTIVE)
      throw new UnauthorizedException('Account is not activated!');

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      role: user.role,
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
            role: UserRole.ADMIN,
          }
        : {
            ...createUserDTO,
            password: hashedPassword,
            role: UserRole.EMPLOYEE,
            status: UserStatus.ACTIVE, // Just in develop
            // status: UserStatus.UNVERIFIED,
          };

    const user = await this.userService.create(userData);

    // Just verify email when account not the first account
    // Delete comment when in production
    // if (userCount !== 0) {
    //   const payload = {
    //     id: user.id,
    //     email: user.email,
    //     fullName: user.fullName,
    //     role: user.role,
    //   };

    //   const token = this.jwtService.sign(payload, {
    //     secret: this.configService.get<string>('VERIFY_EMAIL_TOKEN'),
    //     expiresIn: this.configService.get<string>('VERIFY_EMAIL_TOKEN_EXPIRES'),
    //   });

    //   const verifyLink = `http://localhost:3000/api/v1/users/auth/verify-email?token=${token}`;

    //   await this.mailService.verifyEmail(user.email, verifyLink);
    // }

    const { password, ...result } = user;
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

    // Check if token is exist in database
    await this.tokenService.isTokenExist(refreshToken, user.id);

    const accessToken = this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
      },
      {
        secret: this.configService.get('ACCESS_TOKEN'),
        expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES'),
      },
    );

    return accessToken;
  }
}
