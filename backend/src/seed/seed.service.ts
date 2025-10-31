import { RoleSeed } from './role.seed';
import { Injectable } from '@nestjs/common';
import { PermissionSeed } from './permission.seed';

@Injectable()
export class SeedService {
  constructor(
    private readonly permissionSeed: PermissionSeed,
    private readonly roleSeed: RoleSeed,
  ) {}

  async seedData() {
    await this.permissionSeed.seed();
    await this.roleSeed.seed();
  }
}
