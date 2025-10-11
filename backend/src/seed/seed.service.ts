import { Injectable } from '@nestjs/common';
import { RoleSeed } from './entities/role.seed';
import { PermissionSeed } from './entities/permission.seed';

@Injectable()
export class SeedService {
  constructor(
    private readonly permissionSeed: PermissionSeed,
    private readonly roleSeed: RoleSeed,
  ) {}

  async onModuleInit() {
    await this.permissionSeed.seed();
    await this.roleSeed.seed();
  }
}
