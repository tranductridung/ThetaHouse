import { UpdateItemDto } from './dto/update-item.dto';
import { Controller, Get, Body, Param, Patch } from '@nestjs/common';
import { ItemService } from './item.service';
import { SourceType } from 'src/common/enums/enum';

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
  async findAll() {
    const items = await this.itemService.findAll();
    return { items };
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

  @Patch('cancel/:sourceType/:sourceId')
  async cancelSource(
    @Param('sourceId') id: string,
    @Param('sourceType') sourceType: SourceType,
  ) {
    const result = await this.itemService.cancelSource(+id, sourceType);
    return { result };
  }
}
