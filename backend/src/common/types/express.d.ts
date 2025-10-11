import {
  UserOAuthData,
  UserPayload,
} from 'src/auth/interfaces/user-payload.interface';

declare module 'express' {
  interface Request {
    user?: UserPayload | UserOAuthData;
  }
}
