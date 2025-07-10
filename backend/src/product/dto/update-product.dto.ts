import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends OmitType(PartialType(CreateProductDto), [
  'useBaseQuantityPricing',
] as const) {}

// export class UpdateProductDto extends PartialType(
//   OmitType(CreateProductDto, ['useBaseQuantityPricing'] as const),
// ) {}
