import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserPayload } from '../user-payload.interface';

@Injectable()
export class VerifyJwtStrategy extends PassportStrategy(
  Strategy,
  'verify-jwt',
) {
  constructor(configService: ConfigService) {
    const secret = configService.get<string>('VERIFY_EMAIL_TOKEN');
    if (!secret)
      throw new UnauthorizedException('VERIFY_EMAIL_TOKEN is not defined');

    super({
      jwtFromRequest: ExtractJwt.fromUrlQueryParameter('token'),
      secretOrKey: secret,
      ignoreExpiration: false,
    });
  }

  validate(payload: UserPayload) {
    return payload;
  }
}
