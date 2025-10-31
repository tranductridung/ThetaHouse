import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { UserModule } from 'src/user/user.module';
import { PassportModule } from '@nestjs/passport';
import { AuthModule } from 'src/auth/auth.module';
import { TokenModule } from 'src/token/token.module';
import { GoogleCalendarService } from './google-calendar.service';
import { EncryptionModule } from 'src/encryption/encryption.module';
import { GoogleCalendarController } from './google-calendar.controller';

@Module({
  imports: [
    JwtModule,
    UserModule,
    AuthModule,
    TokenModule,
    PassportModule,
    EncryptionModule,
  ],
  controllers: [GoogleCalendarController],
  providers: [GoogleCalendarService],
  exports: [GoogleCalendarService],
})
export class GoogleCalendarModule {}
