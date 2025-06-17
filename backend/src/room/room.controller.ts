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
import { RoomService } from './room.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('rooms')
export class RoomController {
  constructor(private readonly roomService: RoomService) {}

  @Post()
  async create(@Body() createRoomDto: CreateRoomDto) {
    const room = await this.roomService.create(createRoomDto);
    return { room };
  }

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.roomService.findAll(paginationDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    const room = await this.roomService.findOne(+id);
    return { room };
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateRoomDto: UpdateRoomDto) {
    const room = await this.roomService.update(+id, updateRoomDto);
    return { room };
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.roomService.remove(+id);
  }
}
