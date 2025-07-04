import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
  Delete,
  Query,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Request } from 'express';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { ExportItemDto } from './dto/export-item.dto';
import { CreateItemDto } from 'src/item/dto/create-item.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { OrderService } from './order.service';

@UseGuards(AuthJwtGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const userId = Number(req.user?.id);
    return await this.orderService.create(createOrderDto, userId);
  }

  @Get('/all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.orderService.findAll(paginationDto);
  }

  @Get()
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.orderService.findAllActive(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.orderService.findOneFull(+id);
    return { order };
  }

  @Post('items/:itemId/export')
  async exportItem(
    @Param('itemId') itemId: string,
    @Body() exportItemDto: ExportItemDto,
    @Req() req: Request,
  ) {
    const creatorId = Number(req.user?.id);
    const result = await this.orderService.exportItem(
      +itemId,
      creatorId,
      exportItemDto.quantity,
    );
    return result;
  }

  @Post(':id/export')
  async exportItemsForOrder(@Param('id') orderId: string, @Req() req: Request) {
    const creatorId = Number(req.user?.id);
    const result = await this.orderService.exportOrder(+orderId, creatorId);
    return result;
  }

  @Post(':id/cancel')
  async cancelOrder(@Param('id') id: string, @Req() req: Request) {
    const creatorId = Number(req.user?.id);

    const result = await this.orderService.cancelOrder(+id, creatorId);
    return result;
  }

  @Post(':id/items')
  async addItem(
    @Param('id') orderId: string,
    @Body() createItemDto: CreateItemDto,
  ) {
    const result = await this.orderService.addItem(+orderId, createItemDto);
    return result;
  }

  @Delete(':id/items/:itemId')
  async removeItem(
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
  ) {
    const result = await this.orderService.removeItem(+orderId, +itemId);
    return result;
  }
}
