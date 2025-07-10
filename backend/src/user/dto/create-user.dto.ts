import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { SexType } from 'src/common/enums/enum';

export class CreateUserDTO {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dob?: Date;

  @IsOptional()
  @IsEnum(SexType)
  sex?: SexType;
}
