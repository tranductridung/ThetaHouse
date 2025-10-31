import { IsOptional, IsString } from 'class-validator';

export class SaveGoogleTokensDto {
  @IsString()
  @IsOptional()
  googleAccessToken?: string | null;

  @IsString()
  @IsOptional()
  googleRefreshToken?: string | null;
}
