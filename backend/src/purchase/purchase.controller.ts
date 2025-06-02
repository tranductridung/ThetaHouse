import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { PurchaseService } from './purchase.service';
import { CreatePurchaseDto } from './dto/create-purchase.dto';
import { Request } from 'express';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { ImportItemDto } from './dto/import-item.dto';

@UseGuards(AuthJwtGuard)
@Controller('purchases')
export class PurchaseController {
  constructor(private readonly purchaseService: PurchaseService) {}

  @Post()
  create(@Body() createPurchaseDto: CreatePurchaseDto, @Req() req: Request) {
    const userId = Number(req.user?.id);
    return this.purchaseService.create(createPurchaseDto, userId);
  }

  @Get()
  async findAll() {
    const purchases = await this.purchaseService.findAll();
    return { purchases };
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
  async exportItemsForOrder(
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
}
