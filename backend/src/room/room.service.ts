import { PaginationDto } from './../common/dtos/pagination.dto';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { UpdateRoomDto } from './dto/update-room.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Room } from './entities/room.entity';
import { Not, Repository } from 'typeorm';

@Injectable()
export class RoomService {
  constructor(@InjectRepository(Room) private roomRepo: Repository<Room>) {}

  async create(createRoomDto: CreateRoomDto) {
    const isNameExist = await this.roomRepo.findOneBy({
      name: createRoomDto.name,
    });

    if (isNameExist) throw new BadRequestException('Room name already exist!');

    const room = this.roomRepo.create(createRoomDto);
    await this.roomRepo.save(room);

    return room;
  }

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.roomRepo
      .createQueryBuilder('room')
      .orderBy('room.id', 'ASC');

    if (paginationDto) {
      const { page, limit, search } = paginationDto;

      if (search) {
        queryBuilder.where('LOWER(room.name) LIKE :search', {
          search: `%${search.toLowerCase()}%`,
        });
      }

      const [rooms, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { rooms, total };
    } else {
      const rooms = await queryBuilder.getMany();
      return rooms;
    }
  }

  async findOne(id: number) {
    const room = await this.roomRepo.findOneBy({ id });

    if (!room) throw new NotFoundException('Room not found!');
    return room;
  }

  async update(id: number, updateRoomDto: UpdateRoomDto) {
    const isNameExist = await this.roomRepo.findOne({
      where: {
        id: Not(id),
        name: updateRoomDto.name,
      },
    });

    if (isNameExist) throw new BadRequestException('Room name already exist!');

    const room = await this.findOne(id);
    this.roomRepo.merge(room, updateRoomDto);
    await this.roomRepo.save(room);

    return room;
  }

  async remove(id: number) {
    const room = await this.findOne(id);

    await this.roomRepo.remove(room);
    return { message: 'Delete room success!' };
  }
}
