import { Type } from 'class-transformer';
import { SexType } from 'src/common/enums/enum';
import { CreateUserDTO } from './create-user.dto';
import { OmitType, PartialType } from '@nestjs/mapped-types';
import { IsDate, IsEnum, IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends OmitType(PartialType(CreateUserDTO), [
  'password',
  'email',
] as const) {
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
