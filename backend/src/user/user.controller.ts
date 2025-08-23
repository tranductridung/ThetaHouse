import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Put,
  Query,
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
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@UseGuards(AuthJwtGuard, RolesGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    console.log('asdflkasd;flk');
    return await this.userService.findAll(paginationDto);
  }

  @Patch(':id/change-role')
  @Roles(UserRole.ADMIN)
  async changeRole(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { role: UserRole },
  ) {
    const currentUser = req?.user;
    if (id === currentUser?.id)
      throw new BadRequestException('Cannot change role by yourself!');

    return await this.userService.changeRole(id, body.role);
  }

  @Patch(':id/change-status')
  @Roles(UserRole.ADMIN)
  async changeStatus(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { status: UserStatus },
  ) {
    const currentUser = req?.user;
    if (id === currentUser?.id)
      throw new BadRequestException('Cannot change status by yourself!');

    return await this.userService.changeStatus(id, body.status);
  }

  @Patch(':id/toggle-status')
  @Roles(UserRole.ADMIN)
  async toggleStatus(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const currentUser = req?.user;
    if (id === currentUser?.id)
      throw new BadRequestException('Cannot change status by yourself!');

    return await this.userService.toggleStatus(id);
  }

  @Get('me')
  getUserInfor(@Req() req: Request) {
    return {
      user: {
        id: req?.user?.id,
        email: req?.user?.email,
        fullName: req?.user?.fullName,
        role: req?.user?.role,
      },
    };
  }

  @Get('me/profile')
  async getProfile(@Req() req: Request) {
    const userId = Number(req?.user?.id);
    const user = await this.userService.findOne(userId);
    return { user };
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

  @Get('/:healerId/appointments')
  async findAppointmentByCustomer(
    @Param('healerId') healerId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.userService.findAppointmentByHealer(
      healerId,
      paginationDto,
    );
  }
}
