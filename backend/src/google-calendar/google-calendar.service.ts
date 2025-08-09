import { EncryptionService } from './../encryption/encryption.service';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { OAuth2Client } from 'google-auth-library';
import { google } from 'googleapis';
import { UserOAuthData } from 'src/auth/user-payload.interface';
import { TokenService } from 'src/token/token.service';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { UserService } from 'src/user/user.service';
import { CreateCalendarDto } from './dtos/create-calendar.dto';

@Injectable()
export class GoogleCalendarService {
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
    const user = await this.userService.findOne(userId, true);

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
}
