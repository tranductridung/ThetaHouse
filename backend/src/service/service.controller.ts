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
import { ServiceService } from './service.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @RequirePermissions('service:create')
  @Post()
  async create(@Body() createServiceDto: CreateServiceDto) {
    const service = await this.serviceService.create(createServiceDto);
    return { service };
  }

  @RequirePermissions('service:read')
  @Get()
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.serviceService.findAllActive(paginationDto);
  }

  @RequirePermissions('service:read')
  @Get('all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.serviceService.findAll(paginationDto);
  }

  @RequirePermissions('service:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const service = await this.serviceService.findOne(+id);
    return { service };
  }

  @RequirePermissions('service:update')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    const service = await this.serviceService.update(+id, updateServiceDto);
    return { service };
  }

  @RequirePermissions('service:delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceService.remove(+id);
  }

  @RequirePermissions('service:update')
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return await this.serviceService.toggleStatus(+id);
  }

  @RequirePermissions('service:update')
  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return await this.serviceService.restore(+id);
  }
}
