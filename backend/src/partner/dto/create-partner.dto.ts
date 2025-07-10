import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { PartnerType, SexType } from 'src/common/enums/enum';

export class CreatePartnerDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  fullName: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  address: string;

  @IsString()
  @IsOptional()
  note: string;

  @IsEnum(PartnerType)
  type: PartnerType;

  @Type(() => Date)
  @IsDate()
  @IsOptional()
  dob?: Date;

  @IsOptional()
  @IsEnum(SexType)
  sex?: SexType;
}
