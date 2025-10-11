import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
} from '@nestjs/common';
import { In, Repository } from 'typeorm';
import { Role } from './entities/role.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { UserService } from 'src/user/user.service';
import { UserRole } from './entities/user-role.entity';
import { CreateRoleDto } from './dtos/create-role.dto';
import { UpdateRoleDto } from './dtos/update-role.dto';
import { Permission } from './entities/permission.entity';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { RolePermission } from './entities/role-permission.entity';
import { CreatePermissionDto } from './dtos/create-permission.dto';
import { UpdatePermissionDto } from './dtos/update-permission.dto';

@Injectable()
export class AuthorizationService {
  constructor(
    @Inject(forwardRef(() => UserService))
    private userService: UserService,
    @InjectRepository(Role) private readonly roleRepo: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepo: Repository<Permission>,
    @InjectRepository(UserRole)
    private readonly userRoleRepo: Repository<UserRole>,
    @InjectRepository(RolePermission)
    private readonly rolePermisisonRepo: Repository<RolePermission>,
  ) {}

  private async assertSuperadmin(userId: number) {
    const roles = await this.getUserRoles(userId);
    const isSuperadmin = roles.roles.some((r) => r.name === 'superadmin');
    if (!isSuperadmin) {
      throw new ForbiddenException('Only superadmin can perform this action!');
    }
  }

  // -------------------------------- ROLES --------------------------------
  async findRole(id: number) {
    const role = await this.roleRepo.findOneBy({ id });
    if (!role) throw new NotFoundException('Role not found!');
    return role;
  }

  async findRoleByName(name: string) {
    const role = await this.roleRepo.findOneBy({ name });
    if (!role) throw new NotFoundException('Role not found!');
    return role;
  }

  async createRole(createRoleDto: CreateRoleDto) {
    const existingRole = await this.roleRepo.findOneBy({
      name: createRoleDto.name,
    });

    if (existingRole) throw new ConflictException(`Role existed!`);

    const role = this.roleRepo.create(createRoleDto);

    await this.roleRepo.save(role);

    return role;
  }

  async findRoles(paginationDto?: PaginationDto) {
    const queryBuilder = this.roleRepo
      .createQueryBuilder('role')
      .orderBy('role.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit, search } = paginationDto;

      if (search) {
        queryBuilder.where('LOWER(role.name) LIKE :search', {
          search: `%${search.toLowerCase()}%`,
        });
      }

      const [roles, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { roles, total };
    } else {
      const roles = await queryBuilder.getMany();
      return roles;
    }
  }

  async updateRole(id: number, updateRoleDto: UpdateRoleDto) {
    if (updateRoleDto.name === 'superadmin')
      return new BadRequestException('Cannot update superadmin role!');

    const role = await this.findRole(id);

    this.roleRepo.merge(role, updateRoleDto);
    await this.roleRepo.save(role);

    return role;
  }

  async removeRole(id: number) {
    const role = await this.findRole(id);

    if (role.name === 'superadmin')
      return new BadRequestException('Cannot delete superadmin role!');

    await this.roleRepo.remove(role);
    return { message: 'Delete role success!' };
  }

  // -------------------------------- PERMISSIONS --------------------------------
  async getPermissions(userId: number, resource?: string) {
    await this.userService.findOne(userId);

    const qb = this.userRoleRepo
      .createQueryBuilder('userRole')
      .leftJoin('userRole.role', 'role')
      .leftJoin('role.rolePermissions', 'rolePermission')
      .leftJoin('rolePermission.permission', 'permission')
      .where('userRole.userId = :userId', { userId });

    if (resource)
      qb.andWhere('permission.resource = :resource', {
        resource: resource.trim().toLowerCase(),
      });

    const rows = await qb
      .select('DISTINCT permission.key', 'permission_key')
      .getRawMany<{ permission_key: string }>();

    return {
      permissions: rows.map((row) => row.permission_key),
    };
  }

  async createPermission(createPermissionDto: CreatePermissionDto) {
    const existingPermission = await this.permissionRepo.findOneBy({
      action: createPermissionDto.action,
      resource: createPermissionDto.resource,
    });

    if (existingPermission) throw new ConflictException(`Permission existed!`);

    const permission = this.permissionRepo.create({
      ...createPermissionDto,
      key: `${createPermissionDto.resource}:${createPermissionDto.action}`,
    });

    await this.permissionRepo.save(permission);

    const role = await this.findRoleByName('superadmin');
    const rolePermission = this.rolePermisisonRepo.create({
      role,
      permission,
    });

    await this.rolePermisisonRepo.save(rolePermission);

    return permission;
  }

  async findPermissions(paginationDto?: PaginationDto) {
    const queryBuilder = this.permissionRepo
      .createQueryBuilder('permission')
      .orderBy('permission.createdAt', 'DESC');

    if (
      paginationDto?.page !== undefined &&
      paginationDto?.limit !== undefined
    ) {
      const { page, limit, search } = paginationDto;

      if (search) {
        queryBuilder.where('LOWER(permission.name) LIKE :search', {
          search: `%${search.toLowerCase()}%`,
        });
      }

      const [permissions, total] = await queryBuilder
        .skip(page * limit)
        .take(limit)
        .getManyAndCount();

      return { permissions, total };
    } else {
      const permissions = await queryBuilder.getMany();
      return permissions;
    }
  }

  async findPermission(id: number) {
    const permission = await this.permissionRepo.findOneBy({ id });
    if (!permission) throw new NotFoundException('Permission not found!');
    return permission;
  }

  async updatePermission(id: number, updatePermissionDto: UpdatePermissionDto) {
    const permission = await this.findPermission(id);

    this.permissionRepo.merge(permission, updatePermissionDto);
    await this.permissionRepo.save(permission);

    return permission;
  }

  async removePermission(id: number) {
    const permission = await this.findPermission(id);

    await this.permissionRepo.remove(permission);
    return { message: 'Delete permission success!' };
  }

  // -------------------------------- USER ROLES --------------------------------
  async assignRoleToUser(userId: number, roleId: number) {
    const hasRole = await this.checkUserRoleExist(userId, roleId);
    if (hasRole) throw new BadRequestException(`User already has role!`);

    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      select: { id: true },
    });

    if (!role) throw new NotFoundException('Role not found');

    const userRole = this.userRoleRepo.create({
      user: { id: userId },
      role: { id: role.id },
    });

    await this.userRoleRepo.save(userRole);
    return role.id;
  }

  // Check lại, chỉ superadmin mới có quyền
  async removeUserRole(currentUserId: number, userId: number, roleId: number) {
    if (currentUserId === userId)
      throw new BadRequestException('You cannot remove your own role');

    const role = await this.roleRepo.findOne({
      where: { id: roleId },
      select: { id: true },
    });

    if (!role) throw new NotFoundException('Role not found');

    await this.userRoleRepo.delete({
      user: { id: userId },
      role: { id: role.id },
    });

    return role.id;
  }

  async checkUserRoleExist(userId: number, roleId: number) {
    return await this.userRoleRepo.exists({
      where: {
        user: { id: userId },
        role: { id: roleId },
      },
    });
  }

  async removeRoleFromUser(userId: number, roleId: number) {
    const hasRole = await this.checkUserRoleExist(userId, roleId);
    if (!hasRole) throw new BadRequestException(`User does not have role!`);

    const role = await this.findRole(roleId);

    await this.userRoleRepo.delete({
      user: { id: userId },
      role,
    });

    return { message: `Removed role success!` };
  }

  async getUserRoles(userId: number) {
    await this.userService.findOne(userId);

    const userRoles = await this.userRoleRepo.find({
      where: { user: { id: userId } },
      relations: ['role'],
    });

    return { roles: userRoles.map((ur) => ur.role) };
  }
  // -------------------------------- ROLE PERMISSIONS --------------------------------
  async assignPermissionsToRole(roleId: number, permissionIds: number[]) {
    // Check role exist
    const role = await this.findRole(roleId);

    const rolePermissions = this.rolePermisisonRepo.create(
      permissionIds.map((permissionId) => ({
        role,
        permission: { id: permissionId },
      })),
    );

    await this.rolePermisisonRepo.save(rolePermissions);
    return { roleId: role.id };
  }

  async removePermissionsFromRole(roleId: number, permissionIds: number[]) {
    // Check role exist
    await this.findRole(roleId);
    await this.rolePermisisonRepo.delete({
      role: { id: roleId },
      permission: { id: In(permissionIds) },
    });
    return { message: 'Remove permissions from role success!' };
  }

  async getPermissionsOfRole(roleId: number) {
    // Check role exist
    await this.findRole(roleId);
    const rolePermissions = await this.rolePermisisonRepo.find({
      where: { role: { id: roleId } },
      relations: ['permission'],
    });
    return {
      permissions: rolePermissions.map((rp) => rp.permission),
    };
  }
  // -------------------------------- USER PERMISSIONS --------------------------------
  async checkPermissions(userId: number, permissions: string[]) {
    const count = await this.userRoleRepo
      .createQueryBuilder('userRole')
      .leftJoin('userRole.role', 'role')
      .leftJoin('role.rolePermissions', 'rolePermission')
      .leftJoin('rolePermission.permission', 'permission')
      .where('userRole.userId = :userId', { userId })
      .andWhere('permission.key IN (:...permissions)', { permissions })
      .getCount();

    //  User must have all permissions
    return count === permissions.length;
  }

  async getUserPermissions(userId: number) {
    const userRoles = await this.userRoleRepo.find({
      where: { user: { id: userId } },
      relations: [
        'role',
        'role.rolePermissions',
        'role.rolePermissions.permission',
      ],
    });

    if (!userRoles || userRoles.length === 0) return [];

    const permissions = userRoles.flatMap((ur) =>
      ur.role.rolePermissions.map((rp) => rp.permission.key),
    );

    return Array.from(new Set(permissions));
  }
}
