import { ConfigService } from '@nestjs/config';
import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDTO } from './dto/login.dto';
import { Request, Response } from 'express';
import { CreateUserDTO } from 'src/user/dto/create-user.dto';
import { VerifyEmailJwtGuard } from './guards/auth.guard';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('login')
  async login(
    @Req() req: Request,
    @Body() loginDto: LoginDTO,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { email, password } = loginDto;

    const { accessToken, refreshToken, user } = await this.authService.login(
      email,
      password,
    );

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: Number(this.configService.get('MAX_AGE')) * 24 * 60 * 60 * 1000,
    });

    return { accessToken, user };
  }

  @Post('signup')
  async signup(@Body() user: CreateUserDTO) {
    return this.authService.signup(user);
  }

  @Post('logout')
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const cookies = req.cookies as { refreshToken?: string };
    const refreshToken = cookies?.refreshToken;

    if (refreshToken) {
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      await this.authService.logout(refreshToken);
    }

    return { message: 'Logout success!' };
  }

  @Get('verify-email')
  @UseGuards(VerifyEmailJwtGuard)
  async verifyEmail(@Query('token') token: string, @Req() req: Request) {
    await this.authService.verifyEmail(Number(req?.user?.id));
    return { message: 'Verify email success!' };
  }

  @Post('refresh')
  async refreshToken(@Req() req: Request) {
    const cookies = req.cookies as { refreshToken?: string };
    const refreshToken = cookies?.refreshToken;
    const accessToken = await this.authService.refresh(refreshToken);

    return { accessToken };
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    return this.authService.sendResetPasswordLink(email);
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordDTO: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDTO);
  }
}
