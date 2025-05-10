import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AuthJwtGuard extends AuthGuard('jwt') {}

@Injectable()
export class RefreshAuthJwtGuard extends AuthGuard('refresh-jwt') {}

@Injectable()
export class VerifyEmailJwtGuard extends AuthGuard('verify-jwt') {}
