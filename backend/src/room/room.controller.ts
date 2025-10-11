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
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @RequirePermissions('room:create')
  @Post()
  async create(@Body() createRoomDto: CreateRoomDto) {
    const room = await this.roomService.create(createRoomDto);
    return { room };
  }

  @RequirePermissions('room:read')
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.roomService.findAll(paginationDto);
  }

  @RequirePermissions('room:read')
  @Get(':id')
  async findOne(@Param('id') id: string) {
    const room = await this.roomService.findOne(+id);
    return { room };
  }

  @RequirePermissions('room:update')
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    const room = await this.roomService.update(+id, updateRoomDto);
    return { room };
  }

  @RequirePermissions('room:delete')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }
}
