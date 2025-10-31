import axios from 'axios';
import { google } from 'googleapis';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UserService } from 'src/user/user.service';
import { CreateCalendarDto } from './dtos/create-calendar.dto';
import { EncryptionService } from './../encryption/encryption.service';
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SaveGoogleTokensDto } from './../user/dto/save-google-tokens.dto';
@Injectable()
export class GoogleCalendarService {
  private oauth2Client: OAuth2Client;

  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private encryptionService: EncryptionService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  async saveGoogleTokens(
    userId: number,
    googleAccessToken?: string | null,
    googleRefreshToken?: string | null,
  ) {
    const saveGoogleTokensDto: SaveGoogleTokensDto = {
      googleAccessToken: googleAccessToken,
      googleRefreshToken: googleRefreshToken,
    };

    const user = await this.userService.saveGoogleTokens(
      userId,
      saveGoogleTokensDto,
    );

    return user;
  }

  setCredentials(accessToken: string, refreshToken: string) {
    this.oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  async createEvent(
    accessToken: string,
    refreshToken: string,
    eventDetails: CreateCalendarDto,
  ) {
    this.setCredentials(accessToken, refreshToken);

    const calendar = google.calendar({
      version: 'v3',
      auth: this.oauth2Client,
    });

    const event = {
      summary: eventDetails.summary,
      description: eventDetails.description,
      start: {
        dateTime: eventDetails.startDateTime.toISOString(),
        timeZone: 'Asia/Ho_Chi_Minh',
      },
      end: {
        dateTime: eventDetails.endDateTime.toISOString(),
        timeZone: 'Asia/Ho_Chi_Minh',
      },
    };

    const response = await calendar.events.insert({
      calendarId: 'primary',
      requestBody: event,
    });

    return response.data;
  }

  async getUserTokens(userId: number) {
    const user = await this.userService.findOne(userId, true, true);

    const decryptedAccessToken = user.googleAccessToken
      ? this.encryptionService.decrypt(user.googleAccessToken)
      : undefined;

    const decryptedRefreshToken = user.googleRefreshToken
      ? this.encryptionService.decrypt(user.googleRefreshToken)
      : undefined;

    return {
      accessToken: decryptedAccessToken,
      refreshToken: decryptedRefreshToken,
    };
  }

  async checkCalendarConnection(userId: number) {
    try {
      const {
        accessToken: googleAccessToken,
        refreshToken: calendarRefreshToken,
      } = await this.getUserTokens(userId);

      if (!calendarRefreshToken) {
        return { connected: false };
      }

      this.oauth2Client.setCredentials({
        access_token: googleAccessToken,
        refresh_token: calendarRefreshToken,
      });

      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      // Call API to check if token valid
      await calendar.calendarList.list();

      return { connected: true };
    } catch (error: any) {
      // Token expired
      if (axios.isAxiosError(error) && error?.response?.status === 401) {
        return { connected: false };
      }

      // Error of Google or system
      throw new InternalServerErrorException('Connect Google Calendar failed!');
    }
  }

  async disconnectCalendar(userId: number) {
    const { refreshToken } = await this.getUserTokens(userId);

    if (!refreshToken) {
      return true;
    }

    await axios.post('https://oauth2.googleapis.com/revoke', null, {
      params: { token: refreshToken },
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    await this.userService.removeCalendarToken(userId);

    return { success: true, message: 'Google calendar is disconnected!' };
  }

  generateOAuthUrl(jwtToken: string) {
    const googleScopes = this.configService.get<string>('GOOGLE_SCOPES');

    if (!googleScopes)
      throw new InternalServerErrorException(
        'Google OAuth configuration is missing!',
      );

    const state = encodeURIComponent(jwtToken);
    const scopes = googleScopes.trim().split(' ');

    const googleOAuthUrl = this.oauth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'select_account consent',
      scope: scopes,
      state,
    });

    return googleOAuthUrl;
  }

  async exchangeCodeForTokens(code: string) {
    const { tokens } = await this.oauth2Client.getToken(code);
    return tokens;
  }

  async getGoogleUserInfo(accessToken: string) {
    const response = await axios.get(
      'https://openidconnect.googleapis.com/v1/userinfo',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );
    return response;
  }
}
