import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../common/enums/enum';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
