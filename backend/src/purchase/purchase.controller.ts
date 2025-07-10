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

@UseGuards(AuthJwtGuard)
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

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

  @Get('all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.purchaseService.findAll(paginationDto);
  }

  @Get()
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.purchaseService.findAllActive(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const purchase = await this.purchaseService.findOneFull(+id);
    return { purchase };
  }

  @Post('items/:itemId/import')
  async exportItem(
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

  @Post(':id/cancel')
  async cancelPurchase(@Param('id') id: string, @Req() req: Request) {
    const creatorId = Number(req.user?.id);

    const result = await this.purchaseService.cancelPurchase(+id, creatorId);
    return result;
  }

  @Post(':id/items')
  async addItem(
    @Param('id') purchaseId: string,
    @Body() createItemDto: CreateItemDto,
  ) {
    const result = await this.purchaseService.addItem(
      +purchaseId,
      createItemDto,
    );
    return result;
  }

  @Delete(':id/items/:itemId')
  async removeItem(
    @Param('id') purchaseId: string,
    @Param('itemId') itemId: string,
  ) {
    const result = await this.purchaseService.removeItem(+purchaseId, +itemId);
    return result;
  }
}
