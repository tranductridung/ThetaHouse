import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreateDiscountDto } from './create-discount.dto';

export class UpdateDiscountDto extends PartialType(
  OmitType(CreateDiscountDto, [
    'value',
    'type',
    'maxDiscountAmount',
    'minTotalValue',
  ] as const),
) {}
