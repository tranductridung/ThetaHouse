import { IsInt, IsOptional, Min } from 'class-validator';

export class HandleItemDto {
  @IsInt()
  @IsOptional()
  @Min(1)
  quantity: number;
}
