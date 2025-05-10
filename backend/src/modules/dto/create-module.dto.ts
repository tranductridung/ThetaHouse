import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ModuleType } from 'src/common/enums/enum';

export class CreateModuleDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  description: string;

  @IsEnum(ModuleType)
  type: ModuleType;
}
