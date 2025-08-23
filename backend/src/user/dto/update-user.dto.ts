import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user.dto';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { SexType } from 'src/common/enums/enum';

export class UpdateUserDto extends OmitType(PartialType(CreateUserDTO), [
  'password',
  'email',
] as const) {
  @IsString()
  @IsOptional()
  accessToken?: string | null;

  @IsString()
  @IsOptional()
  refreshToken?: string | null;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dob?: Date;

  @IsOptional()
  @IsEnum(SexType)
  sex?: SexType;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;
}
