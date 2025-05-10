import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDTO {
  @IsString()
  fullName: string;

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  phoneNumber: string;

  @IsString()
  @IsOptional()
  address: string;
}
