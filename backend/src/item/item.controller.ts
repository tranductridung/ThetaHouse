import { UpdateItemDto } from './dto/update-item.dto';
import { Controller, Get, Body, Param, Patch, Query } from '@nestjs/common';
import { ItemService } from './item.service';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  // @Post()
  // async add(
  //   @Body()
  //   data: {
  //     createItemDto: CreateItemDto;
  //     sourceId: number;
  //     sourceType: SourceType;
  //   },
  // ) {
  //   const item = await this.itemService.add(
  //     data.createItemDto,
  //     data.sourceId,
  //     data.sourceType,
  //   );
  //   return { item };
  // }

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

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateItemDto: UpdateItemDto) {
    const item = await this.itemService.update(+id, updateItemDto);
    return { item };
  }
}
