import {
  Req,
  Body,
  Get,
  Query,
  Param,
  Patch,
  UseGuards,
  Controller,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { UserService } from './user.service';
import { UserStatus } from 'src/common/enums/enum';
import { UpdateUserDto } from './dto/update-user.dto';
import { ChangePasswordDTO } from './dto/change-pass.dto';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UserPayload } from 'src/auth/interfaces/user-payload.interface';
import { PermissionsGuard } from 'src/authorization/guards/permission.guard';
import { RequirePermissions } from 'src/auth/decorators/permissions.decorator';

@UseGuards(AuthJwtGuard, PermissionsGuard)
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @RequirePermissions('user:read')
  @Get()
  async findAll(@Query() paginationDto: PaginationDto) {
    return await this.userService.findAll(paginationDto);
  }

  // @Patch(':id/change-role')
  // @RequirePermissions(UserRole.ADMIN)
  // async changeRole(
  //   @Req() req: Request,
  //   @Param('id', ParseIntPipe) id: number,
  //   @Body() body: { role: UserRole },
  // ) {
  //   const currentUser = req?.user;
  //   if (id === currentUser?.id)
  //     throw new BadRequestException('Cannot change role by yourself!');

  //   return await this.userService.changeRole(id, body.role);
  // }

  @RequirePermissions('user:update')
  @Patch(':id/change-status')
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

  @RequirePermissions('user:update')
  @Patch(':id/toggle-status')
  async toggleStatus(
    @Req() req: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const currentUser = req?.user;
    if (id === currentUser?.id)
      throw new BadRequestException('Cannot change status by yourself!');

    return await this.userService.toggleStatus(id);
  }

  @RequirePermissions('user:read')
  @Get('me')
  getUserInfor(@Req() req: Request) {
    return {
      user: {
        id: req?.user?.id,
        email: req?.user?.email,
        fullName: req?.user?.fullName,
        roles: req?.user?.roles,
      },
    };
  }

  @RequirePermissions('user:read')
  @Get('me/profile')
  async getProfile(@Req() req: Request) {
    const userId = Number(req?.user?.id);
    const user = await this.userService.findOne(
      userId,
      undefined,
      undefined,
      true,
    );
    return { user };
  }

  @RequirePermissions('user:update')
  @Patch('me')
  async updateProfile(@Req() req: Request, @Body() data: UpdateUserDto) {
    const user = await this.userService.updateUser(Number(req?.user?.id), data);
    return { user };
  }

  @RequirePermissions('user:update')
  @Patch('me/password')
  async changePassword(@Req() req: Request, @Body() data: ChangePasswordDTO) {
    return await this.userService.changePassword(data, Number(req?.user?.id));
  }

  @RequirePermissions('user:read', 'appointment:read')
  @Get(':healerId/appointments')
  async findAppointmentByCustomer(
    @Param('healerId') healerId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return await this.userService.findAppointmentByHealer(
      healerId,
      paginationDto,
    );
  }

  @Get('me/permissions')
  async getUserPermission(
    @Req() req: Request,
    @Query('resource') resource?: string,
  ) {
    const userId = (req?.user as UserPayload).id;
    const permissions = await this.userService.getUserPermission(
      +userId,
      resource,
    );

    return permissions;
  }
}
