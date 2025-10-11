import {
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Delete,
  UseGuards,
  Controller,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @RequirePermissions('product:create')
  @Post()
  async create(@Body() createProductDto: CreateProductDto) {
    const product = await this.productService.create(createProductDto);
    return { product };
  }

  @RequirePermissions('product:read')
  @Get()
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.productService.findAllActive(paginationDto);
  }

  @RequirePermissions('product:read')
  @Get('all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.productService.findAll(paginationDto);
  }

  @RequirePermissions('product:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const product = await this.productService.findOne(+id);
    return { product };
  }

  @RequirePermissions('product:update')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    const product = await this.productService.update(+id, updateProductDto);

    return { product };
  }

  @RequirePermissions('product:delete')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return await this.productService.remove(+id);
  }

  @RequirePermissions('product:update')
  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return await this.productService.restore(+id);
  }

  @RequirePermissions('product:update')
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return await this.productService.toggleStatus(+id);
  }
}
