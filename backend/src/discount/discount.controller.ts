import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/common/enums/enum';
import { DiscountService } from './discount.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@UseGuards(AuthJwtGuard, RolesGuard)
@Controller('discounts')
export class DiscountController {
  constructor(private readonly discountService: DiscountService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createDiscountDto: CreateDiscountDto) {
    const discount = await this.discountService.create(createDiscountDto);
    return { discount };
  }

  @Get()
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.discountService.findAllActive(paginationDto);
  }

  @Roles(UserRole.ADMIN)
  @Get('all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.discountService.findAll(paginationDto);
  }

  @Roles(UserRole.ADMIN)
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const discount = await this.discountService.findOne(+id);
    return { discount };
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDiscountDto: UpdateDiscountDto,
  ) {
    const discount = await this.discountService.update(+id, updateDiscountDto);
    return { discount };
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.discountService.remove(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return await this.discountService.restore(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return await this.discountService.toggleStatus(+id);
  }
}
