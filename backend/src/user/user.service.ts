import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDTO } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDTO } from './dto/change-pass.dto';
import * as bcrypt from 'bcrypt';
import { UserRole, UserStatus } from 'src/common/enums/enum';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly configService: ConfigService,
  ) {}

  async findAll() {
    return await this.userRepo.find();
  }

  async findByEmail(email: string) {
    const user = await this.userRepo.findOne({
      where: { email },
      select: ['id', 'email', 'fullName', 'password', 'role', 'status'],
    });

    if (!user) throw new NotFoundException('User not found!');
    return user;
  }

  async findOne(id: number) {
    const user = await this.userRepo.findOneBy({ id });

    if (!user) throw new NotFoundException('User not found');
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

  async changeRole(id: number, role: UserRole) {
    const user = await this.findOne(id);

    user.role = role;
    await this.userRepo.save(user);
    return { message: `User role is changed to ${user.role}` };
  }

  async updateUser(id: number, updateData: UpdateUserDto) {
    const user = await this.findOne(id);

    this.userRepo.merge(user, updateData);
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
}
