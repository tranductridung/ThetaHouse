import { IsEnum, IsOptional } from 'class-validator';
import { UserRole, UserStatus } from 'src/common/enums/enum';

export class UpdateStatusRoleDTO {
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @IsEnum(UserStatus)
  @IsOptional()
  status?: UserStatus;
}
