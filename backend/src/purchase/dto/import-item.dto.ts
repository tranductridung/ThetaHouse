import { IsInt, IsOptional, Min } from 'class-validator';

export class ImportItemDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity: number;
}
