import { ItemService } from './item.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @RequirePermissions('item:read')
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.itemService.findAll(paginationDto);
  }

  @RequirePermissions('item:read')
  @Get()
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.itemService.findAllActive(paginationDto);
  }

  @RequirePermissions('item:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const item = await this.itemService.findOne(+id);
    return { item };
  }
}
