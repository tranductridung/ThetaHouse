import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { UserRole } from 'src/common/enums/enum';
import { Roles } from 'src/auth/roles.decorator';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('modules')
export class ModulesController {
  constructor(private readonly moduleService: ModulesService) {}

  @Roles(UserRole.ADMIN)
  @Post()
  async create(@Body() createModuleDto: CreateModuleDto) {
    const module = await this.moduleService.create(createModuleDto);
    return { module };
  }

  @Get()
  async findAllActive(@Query() paginationDto: PaginationDto) {
    return await this.moduleService.findAllActive(paginationDto);
  }

  @Roles(UserRole.ADMIN)
  @Get('all')
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.moduleService.findAll(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const module = await this.moduleService.findOne(+id);
    return { module };
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateModuleDto: UpdateModuleDto,
  ) {
    const module = await this.moduleService.update(+id, updateModuleDto);
    return { module };
  }

  @Roles(UserRole.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.moduleService.remove(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/toggle-status')
  async toggleStatus(@Param('id') id: string) {
    return await this.moduleService.toggleStatus(+id);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id/restore')
  async restore(@Param('id') id: string) {
    return await this.moduleService.restore(+id);
  }
}
