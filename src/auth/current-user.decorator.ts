import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    // Retorna o objeto inteiro que o `validate` da JwtStrategy devolveu,
    // ou seja: { userId, email, institutionId }
    return request.user;
  },
);
