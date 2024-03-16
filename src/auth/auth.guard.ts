import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}
  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest();
    try {
      const tokenPayLoad = this.authService.checkToken(
        (req.headers.authorization ?? '').split(' ')[1],
      );
      req.tokenPayLoad = tokenPayLoad;
      req.user = await this.userService.getUser(tokenPayLoad.id);
      return true;
    } catch (error) {
      return false;
    }
  }
}
