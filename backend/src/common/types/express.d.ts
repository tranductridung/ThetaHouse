import { UserPayload } from 'src/auth/user-payload.interface';

declare module 'express' {
  interface Request {
    user?: UserPayload;
  }
}
