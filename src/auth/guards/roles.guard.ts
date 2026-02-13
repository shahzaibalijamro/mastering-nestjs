import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { UserRole } from 'src/user/entities/user.entity';
import { ROLES_KEY } from 'src/utils/roles.decorator';
import { UserWithoutPassword } from '../interfaces/user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );
    // If no roles are specified for the route, allow access
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (requiredRoles.includes(user.role)) {
      return true;
    } else {
        // If the user doesn't have the required role, throw a ForbiddenException
      throw new ForbiddenException('Only sellers are authorized to perform this action!');
    }
  }
}
