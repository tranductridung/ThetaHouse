import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { RoleSeed } from './entities/role.seed';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedController } from './seed.controller';
import { PermissionSeed } from './entities/permission.seed';
import { Role } from 'src/authorization/entities/role.entity';
import { Permission } from 'src/authorization/entities/permission.entity';
import { RolePermission } from 'src/authorization/entities/role-permission.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Permission, Role, RolePermission])],
  providers: [SeedService, PermissionSeed, RoleSeed],
  controllers: [SeedController],
})
export class SeedModule {}
