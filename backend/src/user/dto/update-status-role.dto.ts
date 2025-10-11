import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional } from 'class-validator';
import { UserStatus } from 'src/common/enums/enum';

export class UpdateStatusRoleDTO {
  @Type(() => Number)
  @IsInt()
  @IsOptional()
  roleId?: number;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
