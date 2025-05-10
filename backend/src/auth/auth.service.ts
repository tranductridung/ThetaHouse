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

    await this.tokenService.create(refreshToken);

    return { accessToken, refreshToken, user: payload };
  }

  async logout(refreshToken: string) {
    return await this.tokenService.removeToken(refreshToken);
  }

  async validate(email: string, password: string) {
    const user = await this.userService.findByEmail(email);

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
}
