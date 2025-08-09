import { PartialType, OmitType } from '@nestjs/mapped-types';
import { CreatePurchaseDto } from './create-purchase.dto';

export class UpdatePurchaseDto extends PartialType(
  OmitType(CreatePurchaseDto, ['payerId'] as const),
) {}
