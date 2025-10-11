import {
  Get,
  Req,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { Request } from 'express';
import { InventoryService } from './inventory.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { CreateAdjustInventoryDto } from './dto/create-adjust-inventory.dto';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('inventories')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @RequirePermissions('inventory:create')
  @Post()
  async create(
    @Req() req: Request,
    @Body() createAdjustInventoryDto: CreateAdjustInventoryDto,
  ) {
    const userId = Number(req.user?.id);
    const inventory = await this.inventoryService.createAdjustInventory(
      createAdjustInventoryDto,
      userId,
    );

    return { inventory };
  }

  @RequirePermissions('inventory:read')
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.inventoryService.findAll(paginationDto);
  }

  @RequirePermissions('inventory:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const inventory = await this.inventoryService.findOne(+id);
    return { inventory };
  }
}
