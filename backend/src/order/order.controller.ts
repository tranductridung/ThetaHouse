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
  Patch,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { Request } from 'express';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { ExportItemDto } from './dto/export-item.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { OrderService } from './order.service';
import { CreateItemDto } from 'src/item/dto/create-item.dto';
import { ChangeCourseDto } from './dto/change-course.dto';

@UseGuards(AuthJwtGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const userId = Number(req.user?.id);

    const order = await this.orderService.create(createOrderDto, userId);
    return { order };
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

  @Post(':id/items/:itemId/transfer')
  async transferService(
    @Param('itemId') itemId: string,
    @Param('id') orderId: string,
    @Body('newCustomerId') newCustomerId: number,
  ) {
    const result = await this.orderService.transferServiceOwner(
      +orderId,
      +itemId,
      +newCustomerId,
    );
    return result;
  }

  @Patch(':id/items/:itemId')
  async update(
    @Param('itemId') itemId: string,
    @Param('id') orderId: string,
    @Body('newCustomerId') newCustomerId: string,
  ) {
    const result = await this.orderService.transferServiceOwner(
      +orderId,
      +itemId,
      +newCustomerId,
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
  async cancelOrder(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('payerId') payerId: number,
  ) {
    const creatorId = Number(req.user?.id);

    const result = await this.orderService.cancelOrder(
      +id,
      creatorId,
      +payerId,
    );
    return result;
  }

  @Post(':id/items')
  async addItem(
    @Param('id') orderId: string,
    @Req() req: Request,
    @Body() createItemDtos: CreateItemDto[],
  ) {
    const creatorId = Number(req.user?.id);

    const result = await this.orderService.addItem(
      +orderId,
      createItemDtos,
      +creatorId,
    );
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

  @Post(':id/items/:itemId/change-course')
  async changeCourse(
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
    @Req() req: Request,
    @Body() changeCourseDto: ChangeCourseDto,
  ) {
    const creatorId = Number(req?.user?.id);

    return await this.orderService.changeCourse(
      +itemId,
      +orderId,
      creatorId,
      changeCourseDto,
    );
  }
}
