import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { Request } from 'express';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';

@UseGuards(AuthJwtGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const userId = Number(req.user?.id);
    return await this.orderService.create(createOrderDto, userId);
  }

  @Get()
  async findAll() {
    const orders = await this.orderService.findAll();
    return { orders };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.orderService.findOneFull(+id);
    return { order };
  }

  @Get('items/:itemId/export')
  async exportItem(@Param('itemId') itemId: string, @Req() req: Request) {
    const creatorId = Number(req.user?.id);
    const result = await this.orderService.exportItem(+itemId, creatorId);
    return result;
  }

  @Get(':id/export')
  async exportItemsForOrder(@Param('id') orderId: string, @Req() req: Request) {
    const creatorId = Number(req.user?.id);
    const result = await this.orderService.exportOrder(+orderId, creatorId);
    return result;
  }
}
