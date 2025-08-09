import { UserRole } from 'src/common/enums/enum';

export interface UserPayload {
  id: number;
  email: string;
  fullName: string;
  role: UserRole;
}

export interface UserOAuthData extends UserPayload {
  accessToken: string;
  refreshToken: string | undefined;
}
