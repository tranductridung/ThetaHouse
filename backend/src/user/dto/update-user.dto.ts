import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateUserDTO } from './create-user.dto';

export class UpdateUserDto extends OmitType(PartialType(CreateUserDTO), [
  'password',
  'email',
] as const) {}
