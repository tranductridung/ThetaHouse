import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends OmitType(PartialType(CreateUserDTO), [
  'password',
  'email',
] as const) {
  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;
}
