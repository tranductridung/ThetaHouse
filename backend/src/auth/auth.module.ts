import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { RolesGuard } from './guards/role.guard';
import { MailModule } from 'src/mail/mail.module';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { TokenModule } from 'src/token/token.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { VerifyJwtStrategy } from './strategies/verife-jwt.strategy';
import { GoogleCalendarStrategy } from '../google-calendar/strategies/google-calendar.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';

@Module({
  imports: [JwtModule.register({}), UserModule, TokenModule, MailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    GoogleCalendarStrategy,
    VerifyJwtStrategy,
    RolesGuard,
  ],
  exports: [AuthService, RolesGuard, VerifyJwtStrategy],
})
export class AuthModule {}
