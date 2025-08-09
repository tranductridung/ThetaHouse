import { Controller, Get, Param, Query } from '@nestjs/common';
import { ItemService } from './item.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.itemService.findAll(paginationDto);
  }

  @Get()
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.itemService.findAllActive(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.itemService.findOne(+id);
    return { item };
  }
}
