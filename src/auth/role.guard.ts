import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from 'src/decorators/role.decorator';
import { Role } from 'src/enums/role.enum';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflactor: Reflector) {}
  canActivate(context: ExecutionContext) {
    const requeridRoles = this.reflactor.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requeridRoles) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest();
    const rolesFilted = requeridRoles.filter((role) => role === user.role);

    return rolesFilted.length > 0;
  }
}
