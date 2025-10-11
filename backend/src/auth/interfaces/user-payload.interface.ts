export interface UserPayload {
  id: number;
  email: string;
  fullName: string;
  roles: string[];
}

export interface UserOAuthData extends UserPayload {
  accessToken: string;
  refreshToken: string | undefined;
}
