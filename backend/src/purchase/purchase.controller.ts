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
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Request } from 'express';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { ImportItemDto } from './dto/import-item.dto';
import { CreateItemDto } from 'src/item/dto/create-item.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';
@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @RequirePermissions('purchase:create')
  @Post()
  async create(
    @Body() createPurchaseDto: CreatePurchaseDto,
    @Req() req: Request,
  ) {
    const userId = Number(req.user?.id);
    const purchase = await this.purchaseService.create(
      createPurchaseDto,
      userId,
    );
    return { purchase };
  }

  @RequirePermissions('purchase:read')
  @Get('all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.purchaseService.findAll(paginationDto);
  }

  @RequirePermissions('purchase:read')
  @Get()
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.purchaseService.findAllActive(paginationDto);
  }

  @RequirePermissions('item:read', 'user:read', 'purchase:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const purchase = await this.purchaseService.findOneFull(+id);
    return { purchase };
  }

  @RequirePermissions(
    'item:import',
    'product:update',
    'purchase:update',
    'inventory:create',
  )
  @Post('items/:itemId/import')
  async importItem(
    @Param('itemId') itemId: string,
    @Req() req: Request,
    @Body() importItemDto: ImportItemDto,
  ) {
    const creatorId = Number(req.user?.id);
    const result = await this.purchaseService.importItem(
      +itemId,
      creatorId,
      importItemDto.quantity,
    );
    return result;
  }

  @RequirePermissions(
    'item:import',
    'product:update',
    'purchase:update',
    'inventory:create',
  )
  @Post(':id/import')
  async importItemsForPurchase(
    @Param('id') purchaseId: string,
    @Req() req: Request,
  ) {
    const creatorId = Number(req.user?.id);
    const result = await this.purchaseService.importPurchase(
      +purchaseId,
      creatorId,
    );
    return result;
  }

  @RequirePermissions(
    'item:cancel',
    'product:update',
    'purchase:cancel',
    'inventory:create',
  )
  @Post(':id/cancel')
  async cancelPurchase(@Param('id') id: string, @Req() req: Request) {
    const creatorId = Number(req.user?.id);

    const result = await this.purchaseService.cancelPurchase(+id, creatorId);
    return result;
  }

  @RequirePermissions('item:create', 'purchase:update')
  @Post(':id/items')
  async addItem(
    @Param('id') purchaseId: string,
    @Body() createItemDtos: CreateItemDto[],
    @Req() req: Request,
  ) {
    const creatorId = Number(req.user?.id);
    const result = await this.purchaseService.addItem(
      +purchaseId,
      createItemDtos,
      +creatorId,
    );
    return result;
  }

  @RequirePermissions(
    'item:cancel',
    'purchase:update',
    'product:update',
    'inventory:create',
  )
  @Delete(':id/items/:itemId')
  async removeItem(
    @Param('id') purchaseId: string,
    @Param('itemId') itemId: string,
  ) {
    const result = await this.purchaseService.removeItem(+purchaseId, +itemId);
    return result;
  }
}
