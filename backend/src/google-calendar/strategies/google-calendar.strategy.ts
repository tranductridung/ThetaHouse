import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';
import { UserOAuthData } from '../../auth/user-payload.interface';

@Injectable()
export class GoogleCalendarStrategy extends PassportStrategy(
  Strategy,
  'google-calendar',
) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
  ) {
    const clientID = configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = configService.get<string>('GOOGLE_CLIENT_SECRET');
    const callbackURL = configService.get<string>(
      'GOOGLE_CALENDAR_CALLBACK_URL',
    );

    if (!clientID || !clientSecret || !callbackURL) {
      throw new Error('Missing Google OAuth configuration in .env');
    }

    super({
      clientID,
      clientSecret,
      callbackURL,
      scope: [
        'email',
        'profile',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/calendar',
      ],
      passReqToCallback: true,
    });
  }

  authorizationParams(): Record<string, string> {
    return {
      prompt: 'select_account',
    };
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const email = profile.emails?.[0]?.value;

    if (!email) {
      return done(
        new UnauthorizedException('Email not found in Google profile'),
        false,
      );
    }

    const userRecord = await this.userService.findByEmail(email, true);

    const user: UserOAuthData & { missingRefreshToken?: boolean } = {
      id: userRecord.id,
      email: userRecord.email,
      fullName: userRecord.fullName,
      role: userRecord.role,
      accessToken,
      refreshToken,
      missingRefreshToken: !refreshToken && !userRecord?.calendarRefreshToken,
    };

    return done(null, user);
  }
}
