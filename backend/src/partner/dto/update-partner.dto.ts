import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreatePartnerDto } from './create-partner.dto';

export class UpdatePartnerDto extends PartialType(
  OmitType(CreatePartnerDto, ['email', 'type'] as const),
) {}
