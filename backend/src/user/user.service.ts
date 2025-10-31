import { AuthorizationService } from './../authorization/authorization.service';
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserStatus } from 'src/common/enums/enum';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDTO } from './dto/change-pass.dto';
import { PaginationDto } from './../common/dtos/pagination.dto';
import { EncryptionService } from 'src/encryption/encryption.service';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { SaveGoogleTokensDto } from './dto/save-google-tokens.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private dataSource: DataSource,
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
    private readonly authorizationService: AuthorizationService,
  ) {}

  async findAll(paginationDto?: PaginationDto) {
    const queryBuilder = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'ur')
      .leftJoinAndSelect('ur.role', 'role')
      .addSelect(['user.createdAt'])
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
    const user = await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .where('user.email = :email', { email })
      .select([
        'user.id',
        'user.email',
        'user.fullName',
        'user.password',
        'user.status',
        'user.googleRefreshToken',
        'userRole',
        'role.name',
      ])
      .getOne();

    if (!user) throw new NotFoundException('User not found!');

    if (isActive && user.status !== UserStatus.ACTIVE)
      throw new BadRequestException(`User status is ${user.status}!`);

    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      password: user.password,
      status: user.status,
      googleRefreshToken: user.googleRefreshToken,
      roles: user.userRoles.map((userRole) => userRole.role.name),
    };
  }

  async findOne(
    id: number,
    isActive?: boolean,
    getCalendarToken?: boolean,
    getUserRoles?: boolean,
  ) {
    const queryBuilder = this.userRepo.createQueryBuilder('user');

    if (getUserRoles) {
      queryBuilder
        .leftJoinAndSelect('user.userRoles', 'ur')
        .leftJoinAndSelect('ur.role', 'role');
    }

    queryBuilder.where('user.id = :id', { id });

    if (getCalendarToken) {
      queryBuilder.addSelect([
        'user.googleAccessToken',
        'user.googleRefreshToken',
      ]);
    }

    const user = await queryBuilder.getOne();

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    if (isActive && user.status !== UserStatus.ACTIVE) {
      throw new BadRequestException('User is not active!');
    }

    return user;
  }

  async create(createUserDto: CreateUserDTO) {
    const userExist = await this.userRepo.findOneBy({
      email: createUserDto.email,
    });

    if (userExist) throw new ConflictException('Email already used');

    const user = this.userRepo.create(createUserDto);
    await this.userRepo.save(user);

    const userRoles = await this.authorizationService.getUserRoles(user.id);

    return { ...user, roles: userRoles.roles.map((role) => role.name) };
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

  async saveGoogleTokens(
    userId: number,
    saveGoogleTokensDto: SaveGoogleTokensDto,
  ) {
    const user = await this.findOne(userId, true);

    if (saveGoogleTokensDto.googleAccessToken) {
      user.googleAccessToken = this.encryptionService.encrypt(
        saveGoogleTokensDto.googleAccessToken,
      );
    }

    if (saveGoogleTokensDto.googleRefreshToken) {
      user.googleRefreshToken = this.encryptionService.encrypt(
        saveGoogleTokensDto.googleRefreshToken,
      );
    }
    await this.userRepo.save(user);

    const { password, ...result } = user;
    return result;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    this.userRepo.merge(user, updateUserDto);

    await this.userRepo.save(user);

    const { password, ...result } = user;
    return result;
  }

  async resetPassword(newPassword: string, id: number) {
    const user = await this.userRepo.findOne({
      where: { id, status: UserStatus.ACTIVE },
      select: ['id', 'password'],
    });

    if (!user) {
      throw new NotFoundException('User not found!');
    }

    user.password = await bcrypt.hash(
      newPassword,
      Number(this.configService.get('SALT')) || 10,
    );

    await this.userRepo.save(user);

    return { message: 'Reset password success!' };
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

  async removeCalendarToken(userId: number) {
    await this.userRepo.update(userId, {
      googleAccessToken: null,
      googleRefreshToken: null,
    });

    return {
      success: true,
      message: 'Removed calendar tokens successfully!',
    };
  }

  async getUserPermission(userId: number, resource?: string) {
    const permissions = await this.authorizationService.getPermissions(
      userId,
      resource,
    );
    return permissions;
  }
}
