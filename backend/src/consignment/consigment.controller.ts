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
import { Request } from 'express';
import { HandleItemDto } from './dto/handle-item.dto';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { ConsignmentService } from './consigment.service';
import { CreateItemDto } from 'src/item/dto/create-item.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateConsignmentDto } from './dto/create-consignment.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('consignments')
export class ConsignmentController {
  constructor(private readonly consignmentService: ConsignmentService) {}

  @RequirePermissions('consignment:create')
  @Post()
  async create(
    @Body() createConsignmentDto: CreateConsignmentDto,
    @Req() req: Request,
  ) {
    const creatorId = Number(req.user?.id);
    const consignment = await this.consignmentService.create(
      createConsignmentDto,
      creatorId,
    );
    return { consignment };
  }

  @RequirePermissions('consignment:read')
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.consignmentService.findAll(paginationDto);
  }

  @RequirePermissions('consignment:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const consignment = await this.consignmentService.findOneFull(+id);
    return { consignment };
  }

  // Export/Import item from consignment
  @RequirePermissions(
    'item:import',
    'item:export',
    'consignment:update',
    'product:update',
    'inventory:create',
  )
  @Post('items/:itemId/handle')
  async handleItem(
    @Param('itemId') itemId: string,
    @Req() req: Request,
    @Body() handleItemDto: HandleItemDto,
  ) {
    const creatorId = Number(req.user?.id);
    const result = await this.consignmentService.handledItem(
      +itemId,
      creatorId,
      handleItemDto.quantity,
    );
    return result;
  }

  @RequirePermissions(
    'item:import',
    'item:export',
    'consignment:update',
    'product:update',
    'inventory:create',
  )
  @Post(':id/handle')
  async handleItemsForConsignment(
    @Param('id') consignmentId: string,
    @Req() req: Request,
  ) {
    const creatorId = Number(req.user?.id);
    const result = await this.consignmentService.handleConsignment(
      +consignmentId,
      creatorId,
    );
    return result;
  }

  @RequirePermissions(
    'item:cancel',
    'consignment:cancel',
    'product:update',
    'inventory:create',
  )
  @Post(':id/cancel')
  async cancelConsignment(
    @Param('id') id: string,
    @Req() req: Request,
    @Body('payerId') payerId?: number,
  ) {
    const creatorId = Number(req.user?.id);

    const result = await this.consignmentService.cancelConsignment(
      +id,
      creatorId,
      payerId ? +payerId : payerId,
    );
    return result;
  }

  @RequirePermissions('item:create', 'consignment:update')
  @Post(':id/items')
  async addItem(
    @Param('id') consignmentId: string,
    @Body() createItemDtos: CreateItemDto[],
    @Req() req: Request,
  ) {
    const creatorId = Number(req.user?.id);

    const result = await this.consignmentService.addItem(
      +consignmentId,
      createItemDtos,
      creatorId,
    );
    return result;
  }

  @RequirePermissions(
    'item:cancel',
    'consignment:update',
    'product:update',
    'inventory:create',
  )
  @Delete(':id/items/:itemId')
  async removeItem(
    @Param('id') consignmentId: string,
    @Param('itemId') itemId: string,
  ) {
    const result = await this.consignmentService.removeItem(
      +consignmentId,
      +itemId,
    );
    return result;
  }
}
