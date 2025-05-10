import { IsEmail, IsEnum, IsOptional, IsString } from 'class-validator';
import { PartnerType } from 'src/common/enums/enum';

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
}
