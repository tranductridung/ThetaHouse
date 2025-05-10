import { OmitType } from '@nestjs/mapped-types';
import { CreateItemInventoryDto } from './create-item-inventory.dto';

export class CreateAdjustInventoryDto extends OmitType(CreateItemInventoryDto, [
  'itemId',
] as const) {}
