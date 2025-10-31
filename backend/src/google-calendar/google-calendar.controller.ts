import {
  Get,
  Req,
  Res,
  Body,
  Post,
  Query,
  UseGuards,
  Controller,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { TokenExpiredError } from 'jsonwebtoken';
import { AuthService } from 'src/auth/auth.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { CreateCalendarDto } from './dtos/create-calendar.dto';
import { GoogleCalendarService } from './google-calendar.service';
import { UserOAuthData } from 'src/auth/interfaces/user-payload.interface';

@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('connect')
  async redirectToGoogle(
    @Req() req: Request,
    @Res() res: Response,
    @Query('accessToken') accessToken: string,
  ) {
    // Validate access token and refresh if needed
    const refreshToken = req.cookies['refreshToken'] as string;
    let decoded: UserOAuthData;

    try {
      decoded = this.jwtService.verify(accessToken, {
        secret: this.configService.get<string>('ACCESS_TOKEN'),
      });

      if (!decoded || !decoded.id) {
        throw new UnauthorizedException('Invalid decoded access token');
      }
    } catch (err: any) {
      if (err instanceof TokenExpiredError && refreshToken) {
        try {
          accessToken = await this.authService.refresh(refreshToken);
          decoded = this.jwtService.verify(accessToken, {
            secret: this.configService.get<string>('ACCESS_TOKEN'),
          });
        } catch (error: any) {
          console.log(error);
          throw new UnauthorizedException('Refresh token invalid!');
        }
      } else throw new UnauthorizedException('Access token invalid!');
    }

    const jwtToken = this.jwtService.sign(
      { userId: decoded.id, email: decoded.email },
      {
        secret: this.configService.get<string>('GOOGLE_STATE_SECRET'),
        expiresIn: this.configService.get<string>(
          'GOOGLE_STATE_SECRET_EXPIRES',
        ),
      },
    );

    const googleOAuthUrl =
      this.googleCalendarService.generateOAuthUrl(jwtToken);

    return res.redirect(googleOAuthUrl);
  }

  @Get('callback')
  async googleCalendarRedirect(
    @Res() res: Response,
    @Query() query: { code: string; state: string },
  ) {
    // Validate state token
    const { code, state } = query;
    let decoded: { userId: number; email: string };
    try {
      decoded = this.jwtService.verify(state, {
        secret: this.configService.get<string>('GOOGLE_STATE_SECRET'),
      });
    } catch (err) {
      throw new UnauthorizedException('Invalid state token');
    }

    // Call Google API to exchange code for tokens
    const tokens = await this.googleCalendarService.exchangeCodeForTokens(code);

    // ---------------------------------------------------------------
    //  CHECK EMAIL MATCHING
    // ---------------------------------------------------------------
    if (!tokens.access_token) throw new Error('Google access token not found');

    const userProfile = await this.googleCalendarService.getGoogleUserInfo(
      tokens.access_token,
    );

    if (userProfile?.data?.email !== decoded.email)
      return new UnauthorizedException(
        'Email mismatch. Please use the Google account you used to sign up.',
      );

    // Save tokens to user's profile
    await this.googleCalendarService.saveGoogleTokens(
      decoded.userId,
      tokens.access_token,
      tokens.refresh_token,
    );

    // Redirect to frontend with success message
    const frontendUrl =
      this.configService.get<string>('FRONTEND_URL') || 'http://localhost:5173';
    return res.redirect(frontendUrl);
  }

  @UseGuards(AuthJwtGuard)
  @Post()
  async createEvent(@Body() dto: CreateCalendarDto) {
    try {
      const tokens = await this.googleCalendarService.getUserTokens(dto.userId);

      if (!tokens.accessToken || !tokens.refreshToken) {
        return {
          success: false,
          message: 'Google Calendar not connected for this user',
        };
      }

      const event = await this.googleCalendarService.createEvent(
        tokens.accessToken,
        tokens.refreshToken,
        dto,
      );

      return {
        success: true,
        message: 'Event created successfully',
        event,
      };
    } catch (error: any) {
      return {
        success: false,
        message: 'Create event failed!',
      };
    }
  }

  @UseGuards(AuthJwtGuard)
  @Get('status')
  async getStatus(@Req() req: Request) {
    const userId = Number(req.user?.id);
    return await this.googleCalendarService.checkCalendarConnection(userId);
  }

  @UseGuards(AuthJwtGuard)
  @Post('disconnect')
  async disconnect(@Req() req: Request) {
    const userId = Number(req.user?.id);
    return await this.googleCalendarService.disconnectCalendar(userId);
  }
}
