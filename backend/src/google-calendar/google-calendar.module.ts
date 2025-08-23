import { Module } from '@nestjs/common';
import { GoogleCalendarService } from './google-calendar.service';
import { GoogleCalendarController } from './google-calendar.controller';
import { TokenModule } from 'src/token/token.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { PassportModule } from '@nestjs/passport';
import { GoogleCalendarStrategy } from './strategies/google-calendar.strategy';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [
    TokenModule,
    JwtModule,
    UserModule,
    EncryptionModule,
    AuthModule,
    PassportModule,
  ],
  controllers: [GoogleCalendarController],
  providers: [GoogleCalendarService, GoogleCalendarStrategy],
  exports: [GoogleCalendarService],
})
export class GoogleCalendarModule {}
