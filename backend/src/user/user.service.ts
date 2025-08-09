import { PaginationDto } from './../common/dtos/pagination.dto';
import { ConfigService } from '@nestjs/config';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDTO } from './dto/change-pass.dto';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus } from 'src/common/enums/enum';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { EncryptionService } from 'src/encryption/encryption.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
  ) {}

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.userRepo
      .createQueryBuilder('user')
      .orderBy('user.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit, search } = paginationDto;

      if (search) {
        queryBuilder.where('LOWER(user.fullName) LIKE :search', {
          search: `%${search.toLowerCase()}%`,
        });
      }

      const [users, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { users, total };
    } else {
      const users = await queryBuilder.getMany();
      return users;
    }
  }

  async findByEmail(email: string, isActive?: boolean) {
    const user = await this.userRepo.findOne({
      where: { email },
      select: [
        'id',
        'email',
        'fullName',
        'password',
        'role',
        'status',
        'calendarRefreshToken',
      ],
    });

    if (!user) throw new NotFoundException('User not found!');

    if (isActive && user.status !== UserStatus.ACTIVE)
      throw new BadRequestException(`User status is ${user.status}!`);

    return user;
  }

  async findOne(id: number, isActive?: boolean) {
    const user = await this.userRepo.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');

    if (isActive && user.status !== UserStatus.ACTIVE)
      throw new BadRequestException('User is not active!');
    return user;
  }

  async create(createUserDto: CreateUserDTO) {
    const userExist = await this.userRepo.findOneBy({
      email: createUserDto.email,
    });

    if (userExist) throw new ConflictException('Email already used');

    if (userExist) {
      throw new ConflictException('Email already exist');
    }

    const user = this.userRepo.create(createUserDto);
    await this.userRepo.save(user);
    return user;
  }

  async countUser() {
    return this.userRepo.count();
  }

  async changeStatus(id: number, status: UserStatus) {
    const user = await this.findOne(id);
    user.status = status;
    await this.userRepo.save(user);
    return { message: `User status is changed to ${user.status}` };
  }

  async toggleStatus(id: number) {
    const user = await this.findOne(id);
    user.status =
      user.status === UserStatus.ACTIVE
        ? UserStatus.INACTIVE
        : UserStatus.ACTIVE;
    await this.userRepo.save(user);
    return { message: `User status is changed to ${user.status}` };
  }

  async changeRole(id: number, role: UserRole) {
    const user = await this.findOne(id);

    user.role = role;
    await this.userRepo.save(user);
    return { message: `User role is changed to ${user.role}` };
  }

  async updateUser(id: number, updateData: UpdateUserDto) {
    const user = await this.findOne(id);

    this.userRepo.merge(user, updateData);
    if (updateData.accessToken) {
      user.calendarAccessToken = this.encryptionService.encrypt(
        updateData.accessToken,
      );
    }

    if (updateData.refreshToken) {
      user.calendarRefreshToken = this.encryptionService.encrypt(
        updateData.refreshToken,
      );
    }

    await this.userRepo.save(user);

    const { password, ...result } = user;
    return result;
  }

  async changePassword(data: ChangePasswordDTO, id: number) {
    const user = await this.userRepo.findOne({
      where: { id },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(data.oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Password incorrect!');
    }

    user.password = await bcrypt.hash(
      data.newPassword,
      Number(this.configService.get('SALT')) || 10,
    );

    await this.userRepo.save(user);

    return { message: 'Change password success!' };
  }

  async findAppointmentByHealer(
    healerId: number,
    paginationDto?: PaginationDto,
  ) {
    const isHealerExist = await this.userRepo.exists({
      where: { id: healerId },
    });

    if (!isHealerExist) throw new NotFoundException(`Healer not found!`);

    const queryBuilder = this.dataSource
      .createQueryBuilder(Appointment, 'appointment')
      .leftJoinAndSelect('appointment.item', 'item')
      .leftJoinAndSelect('appointment.healer', 'healer')
      .leftJoinAndSelect('appointment.room', 'room')
      .leftJoinAndSelect('appointment.customer', 'customer')
      .select([
        'appointment.id',
        'appointment.note',
        'appointment.startAt',
        'appointment.endAt',
        'appointment.createdAt',
        'appointment.category',
        'appointment.duration',
        'appointment.status',
        'appointment.type',
        'item.id',
        'healer.fullName',
        'healer.id',
        'customer.fullName',
        'customer.id',
        'room.name',
        'room.id',
      ])
      .where('healer.id = :healerId', { healerId })
      .orderBy('appointment.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit } = paginationDto;

      const [appointments, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { appointments, total };
    } else {
      const appointments = await queryBuilder.getMany();
      return appointments;
    }
  }
}
