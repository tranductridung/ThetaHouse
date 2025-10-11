import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('modules')
export class ModulesController {
  constructor(private readonly moduleService: ModulesService) {}

  @RequirePermissions('module:create')
  @Post()
  async create(@Body() createModuleDto: CreateModuleDto) {
    const module = await this.moduleService.create(createModuleDto);
    return { module };
  }

  @RequirePermissions('module:read')
  @Get()
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.moduleService.findAllActive(paginationDto);
  }

  @RequirePermissions('module:read')
  @Get('all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.moduleService.findAll(paginationDto);
  }

  @RequirePermissions('module:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const module = await this.moduleService.findOne(+id);
    return { module };
  }

  @RequirePermissions('module:update')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    const module = await this.moduleService.update(+id, updateModuleDto);
    return { module };
  }

  @RequirePermissions('module:delete')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moduleService.remove(+id);
  }

  @RequirePermissions('module:update')
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return await this.moduleService.toggleStatus(+id);
  }

  @RequirePermissions('module:update')
  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return await this.moduleService.restore(+id);
  }
}
