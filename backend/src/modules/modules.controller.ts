import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { ModulesService } from './modules.service';
import { UserRole } from 'src/common/enums/enum';
import { Roles } from 'src/auth/roles.decorator';
import { CreateModuleDto } from './dto/create-module.dto';
import { UpdateModuleDto } from './dto/update-module.dto';

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
  async findAllActive() {
    const modules = await this.moduleService.findAllActive();
    return { modules };
  }

  @Roles(UserRole.ADMIN)
  @Get('all')
  async findAll() {
    const modules = await this.moduleService.findAll();
    return { modules };
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const module = await this.moduleService.findOne(+id);
    return { module };
  }

  @Roles(UserRole.ADMIN)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateModuleDto: UpdateModuleDto) {
    return this.moduleService.update(+id, updateModuleDto);
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
