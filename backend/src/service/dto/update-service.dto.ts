import { OmitType } from '@nestjs/mapped-types';
import { CreateServiceDto } from './create-service.dto';

export class UpdateServiceDto extends OmitType(CreateServiceDto, [
  'type',
] as const) {}
