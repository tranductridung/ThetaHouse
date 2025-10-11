import {
  Get,
  Post,
  Body,
  Query,
  Patch,
  Param,
  Delete,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { DiscountService } from './discount.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('discounts')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @RequirePermissions('discount:create')
  @Post()
  async create(@Body() createDiscountDto: CreateDiscountDto) {
    const discount = await this.discountService.create(createDiscountDto);
    return { discount };
  }

  @RequirePermissions('discount:read')
  @Get()
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.discountService.findAllActive(paginationDto);
  }

  @RequirePermissions('discount:read')
  @Get('all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.discountService.findAll(paginationDto);
  }

  @RequirePermissions('discount:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const discount = await this.discountService.findOne(+id);
    return { discount };
  }

  @RequirePermissions('discount:update')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    const discount = await this.discountService.update(+id, updateDiscountDto);
    return { discount };
  }

  @RequirePermissions('discount:delete')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.discountService.remove(+id);
  }

  @RequirePermissions('discount:update')
  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return await this.discountService.restore(+id);
  }

  @RequirePermissions('discount:update')
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return await this.discountService.toggleStatus(+id);
  }
}
