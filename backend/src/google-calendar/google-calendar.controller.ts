import { GoogleCalendarService } from './google-calendar.service';
import { UserOAuthData } from 'src/auth/user-payload.interface';
import { ConfigService } from '@nestjs/config';
import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CreateCalendarDto } from './dtos/create-calendar.dto';
import { GoogleCalendarGuard } from './guards/google-calendar.guard';

@Controller('google-calendar')
export class GoogleCalendarController {
  constructor(
    private readonly googleCalendarService: GoogleCalendarService,
    private configService: ConfigService,
  ) {}

  // @UseGuards(AuthJwtGuard)
  @Get()
  @UseGuards(GoogleCalendarGuard)
  async googleAuth() {}

  // @UseGuards(AuthJwtGuard)
  @Get('callback')
  @UseGuards(GoogleCalendarGuard)
  async googleCallback(@Req() req: Request, @Res() res: Response) {
    const user = req.user as UserOAuthData & { missingRefreshToken?: boolean };

    if (user.missingRefreshToken && !req.query?.force)
      return res.redirect('/api/v1/google-calendar/force');

    const jwtToken = await this.googleCalendarService.saveCalendarTokens(user);

    res.cookie('refreshToken', jwtToken.refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: 'strict',
      maxAge: Number(this.configService.get('MAX_AGE')) * 24 * 60 * 60 * 1000,
    });

    const { id, email, fullName, role } = user;

    return res.json({
      accessToken: jwtToken.accessToken,
      user: { id, email, fullName, role },
    });
  }

  // @UseGuards(AuthJwtGuard)
  @Get('force')
  forceGoogleAuth(@Req() req: Request, @Res() res: Response) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>(
      'GOOGLE_CALENDAR_CALLBACK_URL',
    );

    const scope = encodeURIComponent(
      'https://www.googleapis.com/auth/calendar https://www.googleapis.com/auth/calendar.events email profile',
    );

    const authUrl =
      `https://accounts.google.com/o/oauth2/v2/auth` +
      `?client_id=${clientId}` +
      `&redirect_uri=${redirectUri}` +
      `&response_type=code` +
      `&scope=${scope}` +
      `&access_type=offline` +
      `&prompt=consent%20select_account`;
    return res.redirect(authUrl);
  }

  @Post('create-event')
  async createEvent(@Body() createCalendarDto: CreateCalendarDto) {
    const userTokens = await this.googleCalendarService.getUserTokens(
      createCalendarDto.userId,
    );

    if (!userTokens.accessToken || !userTokens.refreshToken)
      return {
        success: false,
        event: null,
      };

    const event = await this.googleCalendarService.createEvent(
      userTokens.accessToken,
      userTokens.refreshToken,
      createCalendarDto,
    );

    return { success: true, event };
  }
}
