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
import { Request } from 'express';
import { OrderService } from './order.service';
import { ExportItemDto } from './dto/export-item.dto';
import { CreateOrderDto } from './dto/create-order.dto';
import { ChangeCourseDto } from './dto/change-course.dto';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateItemDto } from 'src/item/dto/create-item.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('orders')
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @RequirePermissions('order:create')
  @Post()
  async create(@Body() createOrderDto: CreateOrderDto, @Req() req: Request) {
    const userId = Number(req.user?.id);

    const order = await this.orderService.create(createOrderDto, userId);
    return { order };
  }

  @RequirePermissions('order:read')
  @Get('/all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.orderService.findAll(paginationDto);
  }

  @RequirePermissions('order:read')
  @Get()
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.orderService.findAllActive(paginationDto);
  }

  @RequirePermissions('order:read', 'item:read', 'user:read', 'discount:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const order = await this.orderService.findOneFull(+id);
    return { order };
  }

  @RequirePermissions(
    'item:export',
    'order:update',
    'product:update',
    'inventory:create',
  )
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

  @RequirePermissions('order:update', 'item:transfer')
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

  @RequirePermissions('order:update', 'item:update')
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

  @RequirePermissions(
    'item:export',
    'order:update',
    'product:update',
    'inventory:create',
  )
  @Post(':id/export')
  async exportItemsForOrder(@Param('id') orderId: string, @Req() req: Request) {
    const creatorId = Number(req.user?.id);
    const result = await this.orderService.exportOrder(+orderId, creatorId);
    return result;
  }

  @RequirePermissions(
    'item:cancel',
    'order:cancel',
    'product:update',
    'inventory:create',
  )
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

  @RequirePermissions('item:create', 'order:update')
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

  @RequirePermissions(
    'item:cancel',
    'order:update',
    'product:update',
    'inventory:create',
  )
  @Delete(':id/items/:itemId')
  async removeItem(
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
  ) {
    const result = await this.orderService.removeItem(+orderId, +itemId);
    return result;
  }

  @RequirePermissions('item:update', 'order:update')
  @Post(':id/items/:itemId/change-course')
  async changeCourse(
    @Req() req: Request,
    @Param('id') orderId: string,
    @Param('itemId') itemId: string,
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
