import { PartialType } from '@nestjs/mapped-types';
import { CreateItemInventoryDto } from './create-item-inventory.dto';

export class UpdateInventoryDto extends PartialType(CreateItemInventoryDto) {}
