import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserModule } from 'src/user/user.module';
import { AuthController } from './auth.controller';
import { RolesGuard } from './guards/role.guard';
import { TokenModule } from 'src/token/token.module';
import { MailModule } from 'src/mail/mail.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshJwtStrategy } from './strategies/refresh-jwt.strategy';
import { VerifyJwtStrategy } from './strategies/verife-jwt.strategy';

@Module({
  imports: [JwtModule.register({}), UserModule, TokenModule, MailModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    RefreshJwtStrategy,
    VerifyJwtStrategy,
    RolesGuard,
  ],
  exports: [AuthService, RolesGuard, VerifyJwtStrategy],
})
export class AuthModule {}
