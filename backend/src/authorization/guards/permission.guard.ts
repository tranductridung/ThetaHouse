import { Request } from 'express';
import { Reflector } from '@nestjs/core';
import { UserPayload } from '../../auth/interfaces/user-payload.interface';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { AuthorizationService } from '../authorization.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private authorizationService: AuthorizationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      'requirePermissions',
      [context.getHandler(), context.getClass()],
    );

    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as UserPayload;

    if (!user) return false;

    if (user.roles.includes('superadmin')) return true;

    if (!requiredPermissions || requiredPermissions.length === 0) return true;

    return await this.authorizationService.checkPermissions(
      user.id,
      requiredPermissions,
    );
  }
}
