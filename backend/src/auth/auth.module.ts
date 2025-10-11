import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { TokenModule } from 'src/token/token.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { VerifyJwtStrategy } from './strategies/verify-email-jwt.strategy';
import { GoogleCalendarStrategy } from '../google-calendar/strategies/google-calendar.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { PermissionsGuard } from '../authorization/guards/permission.guard';
import { AuthorizationModule } from 'src/authorization/authorization.module';

@Module({
  imports: [
    JwtModule.register({}),
    UserModule,
    TokenModule,
    MailModule,
    AuthorizationModule,
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    GoogleCalendarStrategy,
    VerifyJwtStrategy,
    PermissionsGuard,
  ],
  exports: [AuthService, PermissionsGuard, VerifyJwtStrategy],
})
export class AuthModule {}
