import { IsInt, IsOptional, Min } from 'class-validator';

export class ExportItemDto {
  @IsInt()
  @Min(1)
  @IsOptional()
  quantity: number;
}
