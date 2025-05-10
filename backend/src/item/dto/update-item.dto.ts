import { OmitType, PartialType } from '@nestjs/mapped-types';
import { CreateItemDto } from './create-item.dto';
import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { ItemStatus } from 'src/common/enums/enum';

export class UpdateItemDto extends PartialType(
  OmitType(CreateItemDto, ['itemableId', 'itemableType'] as const),
) {
  @IsObject()
  @IsOptional()
  snapshotData?: object;

  @IsEnum(ItemStatus)
  @IsOptional()
  status?: ItemStatus;
}
