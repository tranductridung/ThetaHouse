import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ServiceService } from './service.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole } from 'src/common/enums/enum';

@UseGuards(AuthJwtGuard, RolesGuard)
@Controller('services')
export class ServiceController {
  constructor(private readonly serviceService: ServiceService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createServiceDto: CreateServiceDto) {
    const service = await this.serviceService.create(createServiceDto);
    return { service };
  }

  @Get()
  async findAllActive() {
    const services = await this.serviceService.findAllActive();
    return { services };
  }

  @Roles(UserRole.ADMIN)
  @Get('all')
  async findAll() {
    const services = await this.serviceService.findAll();
    return { services };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const service = await this.serviceService.findOne(+id);
    return { service };
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
  ) {
    const service = await this.serviceService.update(+id, updateServiceDto);
    return { service };
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceService.remove(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return await this.serviceService.toggleStatus(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return await this.serviceService.restore(+id);
  }
}
