import {
  ExecutionContext,
  NotFoundException,
  createParamDecorator,
} from '@nestjs/common';

export const User = createParamDecorator(
  (filter: string, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    if (req.user) {
      if (filter) {
        req.user[filter];
      } else {
        return req.user;
      }
    } else {
      throw new NotFoundException(
        'usuário não encontrato no Request. Adicione o user no AuthGuard.',
      );
    }
  },
);
