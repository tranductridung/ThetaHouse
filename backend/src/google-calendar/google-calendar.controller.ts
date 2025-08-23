import { GoogleCalendarGuard } from './guards/google-calendar.guard';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request, Response } from 'express';
import { GoogleCalendarService } from './google-calendar.service';
import { CreateCalendarDto } from './dtos/create-calendar.dto';
import { UserOAuthData } from 'src/auth/user-payload.interface';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/auth/auth.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';

@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private readonly jwtService: JwtService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get()
  async redirectToGoogle(@Req() req: Request, @Res() res: Response) {
    let jwtToken = req.query.token as string;
    const refreshToken = req.cookies['refreshToken'] as string;

    try {
      this.jwtService.verify(jwtToken, {
        secret: this.configService.get<string>('ACCESS_TOKEN'),
      });
    } catch (err) {
      if (err.name === 'TokenExpiredError' && refreshToken) {
        try {
          jwtToken = await this.authService.refresh(refreshToken);
        } catch (error) {
          console.log(error);
          throw new UnauthorizedException('Refresh token invalid!');
        }
      } else {
        throw new UnauthorizedException('Access token invalid!');
      }
    }

    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>(
      'GOOGLE_CALENDAR_CALLBACK_URL',
    );
    const state = encodeURIComponent(jwtToken);

    const scope = encodeURIComponent(
      [
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
      ].join(' '),
    );

    const googleOAuthUrl =
      `https://accounts.google.com/o/oauth2/v2/auth?` +
      `response_type=code&` +
      `client_id=${clientId}&` +
      `redirect_uri=${redirectUri}&` +
      `scope=${scope}&` +
      `access_type=offline&` +
      `prompt=select_account%20consent&` +
      `state=${state}`;

    return res.redirect(googleOAuthUrl);
  }

  @Get('callback')
  @UseGuards(GoogleCalendarGuard)
  async googleCalendarRedirect(@Req() req: Request, @Res() res: Response) {
    const user = req?.user as UserOAuthData;

    // Lưu token Google vào DB nếu cần
    await this.googleCalendarService.saveCalendarTokens(user);

    return res.redirect('http://localhost:5173');
  }

  @Post('create-event')
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
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to create event',
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
