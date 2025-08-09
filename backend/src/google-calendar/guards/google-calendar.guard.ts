import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class GoogleCalendarGuard extends AuthGuard('google-calendar') {}
