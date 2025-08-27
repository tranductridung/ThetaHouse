import axios from 'axios';
import { google } from 'googleapis';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';
import { UserService } from 'src/user/user.service';
import { TokenService } from 'src/token/token.service';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { CreateCalendarDto } from './dtos/create-calendar.dto';
import { UserOAuthData } from 'src/auth/user-payload.interface';
import { EncryptionService } from './../encryption/encryption.service';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

@Injectable()
export class GoogleCalendarService {
  private readonly logger = new Logger(GoogleCalendarService.name);
  private oauth2Client: OAuth2Client;

  constructor(
    private configService: ConfigService,
    private jwtService: JwtService,
    private userService: UserService,
    private tokenService: TokenService,
    private encryptionService: EncryptionService,
  ) {
    this.oauth2Client = new google.auth.OAuth2(
      this.configService.get<string>('GOOGLE_CLIENT_ID'),
      this.configService.get<string>('GOOGLE_CLIENT_SECRET'),
      this.configService.get<string>('GOOGLE_REDIRECT_URI'),
    );
  }

  async saveCalendarTokens(userData: UserOAuthData) {
    const payload = {
      id: userData.id,
      email: userData.email,
      fullName: userData.fullName,
      role: userData.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESS_TOKEN'),
      expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESH_TOKEN'),
      expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES'),
    });

    const updateUserDto: UpdateUserDto = {
      accessToken: userData.accessToken,
    };

    if (userData.refreshToken) {
      updateUserDto.refreshToken = userData.refreshToken;
    }

    await this.userService.updateUser(userData.id, updateUserDto);
    await this.tokenService.create(refreshToken, payload.id);

    return { accessToken, refreshToken, user: payload };
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

    const decryptedAccessToken = user.calendarAccessToken
      ? this.encryptionService.decrypt(user.calendarAccessToken)
      : undefined;

    const decryptedRefreshToken = user.calendarRefreshToken
      ? this.encryptionService.decrypt(user.calendarRefreshToken)
      : undefined;

    return {
      accessToken: decryptedAccessToken ?? undefined,
      refreshToken: decryptedRefreshToken ?? undefined,
    };
  }

  async checkCalendarConnection(userId: number) {
    try {
      const {
        accessToken: calendarAccessToken,
        refreshToken: calendarRefreshToken,
      } = await this.getUserTokens(userId);

      if (!calendarAccessToken || !calendarRefreshToken) {
        return { connected: false };
      }

      this.oauth2Client.setCredentials({
        access_token: calendarAccessToken,
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
}
