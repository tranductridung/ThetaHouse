import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Strategy, Profile, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';
import { UserService } from 'src/user/user.service';
import { Request } from 'express';
import { UserOAuthData } from '../../auth/interfaces/user-payload.interface';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class GoogleCalendarStrategy extends PassportStrategy(
  Strategy,
  'google-calendar',
) {
  constructor(
    private configService: ConfigService,
    private userService: UserService,
    private jwtService: JwtService,
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
        'https://www.googleapis.com/auth/calendar.readonly',
        'https://www.googleapis.com/auth/calendar.settings.readonly',
      ],
      passReqToCallback: true,
    });
  }

  authorizationParams(req: Request): Record<string, string> {
    const token = req.query.token as string;
    if (!token) {
      throw new UnauthorizedException('Missing token in query');
    }

    return {
      prompt: 'select_account consent',
      access_type: 'offline',
      include_granted_scopes: 'true',
      state: token,
    };
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: Profile,
    done: VerifyCallback,
  ) {
    const googleEmail = profile.emails?.[0]?.value;
    const jwtToken = req.query.state as string;

    if (!googleEmail || !jwtToken) {
      return done(new UnauthorizedException('Missing email or token'), false);
    }

    let decoded: UserOAuthData;
    try {
      decoded = this.jwtService.verify(jwtToken, {
        secret: this.configService.get<string>('ACCESS_TOKEN'),
      });
    } catch (err) {
      return done(new UnauthorizedException('Invalid JWT token'), false);
    }

    const systemEmail = decoded.email;

    if (googleEmail !== systemEmail) {
      return done(new UnauthorizedException('Email mismatch'), false);
    }

    const userRecord = await this.userService.findByEmail(googleEmail, true);

    const user: UserOAuthData = {
      id: userRecord.id,
      email: userRecord.email,
      fullName: userRecord.fullName,
      roles: ['hello'],
      // roles: userRecord.roles,
      // permissions: userRecord.permissions,
      accessToken,
      refreshToken,
    };

    return done(null, user);
  }
}
