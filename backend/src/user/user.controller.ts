import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { RolesGuard } from 'src/auth/guards/role.guard';
import { Roles } from 'src/auth/roles.decorator';
import { UserRole, UserStatus } from 'src/common/enums/enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDTO } from './dto/change-pass.dto';
import { Request } from 'express';

@UseGuards(AuthJwtGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  async findAll() {
    const users = await this.userService.findAll();
    return { users: users };
  }

  @Patch(':id/change-role')
  @Roles(UserRole.ADMIN)
  async changeRole(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    role: UserRole,
  ) {
    const currentUser = req?.user;
    if (id === currentUser?.id)
      throw new BadRequestException('Cannot change role by yourself!');

    return await this.userService.changeRole(id, role);
  }

  @Patch(':id/change-status')
  @Roles(UserRole.ADMIN)
  async changeStatus(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    status: UserStatus,
  ) {
    const currentUser = req?.user;
    if (id === currentUser?.id)
      throw new BadRequestException('Cannot change status by yourself!');

    return await this.userService.changeStatus(id, status);
  }

  @Get('me')
  async getProfile(@Req() req: Request) {
    const userId = Number(req?.user?.id);
    return await this.userService.findOne(userId);
  }

  @Put('me')
  async updateProfile(@Req() req: Request, @Body() data: UpdateUserDto) {
    const user = await this.userService.updateUser(Number(req?.user?.id), data);
    return { user };
  }

  @Patch('me/password')
  async changePassword(@Req() req: Request, @Body() data: ChangePasswordDTO) {
    return await this.userService.changePassword(data, Number(req?.user?.id));
  }
}
