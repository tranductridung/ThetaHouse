import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { Request } from 'express';
import { Roles } from 'src/auth/roles.decorator';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { UserRole } from 'src/common/enums/enum';
import { CreateAdjustInventoryDto } from './dto/create-adjust-inventory.dto';

@Controller('inventories')
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @UseGuards(AuthJwtGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Post()
  create(
    @Req() req: Request,
    @Body() createAdjustInventoryDto: CreateAdjustInventoryDto,
  ) {
    const userId = Number(req.user?.id);
    return this.inventoryService.createAdjustInventory(
      createAdjustInventoryDto,
      userId,
    );
  }

  @Get()
  async findAll() {
    const inventories = await this.inventoryService.findAll();
    return { inventories };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const inventory = await this.inventoryService.findOne(+id);
    return { inventory };
  }
}
