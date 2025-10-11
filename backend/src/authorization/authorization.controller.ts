import {
  Req,
  Get,
  Body,
  Post,
  Query,
  Patch,
  Param,
  Delete,
  Controller,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { CreateRoleDto } from './dtos/create-role.dto';
import { AuthJwtGuard } from 'src/auth/guards/auth.guard';
import { SuperAdminGuard } from './guards/superadmin.guard';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { AuthorizationService } from './authorization.service';
import { UpdatePermissionDto } from './dtos/update-permission.dto';
import { CreatePermissionDto } from './dtos/create-permission.dto';

@UseGuards(AuthJwtGuard, SuperAdminGuard)
@Controller('authorization')
export class AuthorizationController {
  constructor(private readonly authorizationService: AuthorizationService) {}

  // ----------------------------------- Role -----------------------------------
  @Post('roles')
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    return await this.authorizationService.createRole(createRoleDto);
  }

  @Get('roles')
  async findRoles(@Query() paginationDto: PaginationDto) {
    return await this.authorizationService.findRoles(paginationDto);
  }

  @Get('roles/:id')
  async findRole(@Param('id') id: string) {
    return await this.authorizationService.findRole(+id);
  }

  @Patch('roles/:id')
  async updateRole(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return await this.authorizationService.updateRole(+id, updateRoleDto);
  }

  @Delete('roles/:id')
  async removeRole(@Param('id') id: string) {
    return await this.authorizationService.removeRole(+id);
  }

  // ----------------------------------- Permission -----------------------------------
  @Post('permissions')
  async createPermission(@Body() createPermissionDto: CreatePermissionDto) {
    return await this.authorizationService.createPermission(
      createPermissionDto,
    );
  }

  @Get('permissions')
  async findPermissions(@Query() paginationDto: PaginationDto) {
    return await this.authorizationService.findPermissions(paginationDto);
  }

  @Get('permissions/:id')
  async findPermission(@Param('id') id: string) {
    return await this.authorizationService.findPermission(+id);
  }

  @Patch('permissions/:id')
  async updatePermission(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return await this.authorizationService.updatePermission(
      +id,
      updatePermissionDto,
    );
  }

  @Delete('permissions/:id')
  async removePermission(@Param('id') id: string) {
    return await this.authorizationService.removePermission(+id);
  }

  // ----------------------------------- User Role & Permissions -----------------------------------
  @Post('users/:userId/roles')
  async assignRoleToUser(
    @Param('userId') userId: string,
    @Body('roleId') roleId: string,
  ) {
    return await this.authorizationService.assignRoleToUser(+userId, +roleId);
  }

  @Delete('users/:userId/roles/:roleId')
  async removeUserRole(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
    @Req() req: Request,
  ) {
    const currentUserId = Number(req?.user?.id);
    return await this.authorizationService.removeUserRole(
      currentUserId,
      +userId,
      +roleId,
    );
  }

  @Get('users/:userId/roles')
  async getUserRoles(@Param('userId') userId: string) {
    return await this.authorizationService.getUserRoles(+userId);
  }

  @Get('users/:userId/permissions')
  async getUserPermissions(@Param('userId') userId: string) {
    return await this.authorizationService.getUserPermissions(+userId);
  }

  @Post('roles/:roleId/permissions')
  async assignPermissionsToRole(
    @Param('roleId') roleId: string,
    @Body('permissionIds') permissionIds: number[],
  ) {
    return await this.authorizationService.assignPermissionsToRole(
      +roleId,
      permissionIds,
    );
  }

  @Delete('roles/:roleId/permissions')
  async removePermissionsToRole(
    @Param('roleId') roleId: string,
    @Body('permissionIds') permissionIds: number[],
  ) {
    return await this.authorizationService.removePermissionsFromRole(
      +roleId,
      permissionIds,
    );
  }

  @Get('roles/:roleId/permissions')
  async getPermissionsOfRole(@Param('roleId') roleId: string) {
    return await this.authorizationService.getPermissionsOfRole(+roleId);
  }
}
