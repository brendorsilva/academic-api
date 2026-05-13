import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from './roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Busca quais roles foram definidas no decorator @Roles()
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se a rota não tiver o decorator @Roles(), libera o acesso
    // (mas o JwtAuthGuard ainda vai exigir que esteja logado)
    if (!requiredRoles) {
      return true;
    }

    // Pega o usuário logado da requisição
    const { user } = context.switchToHttp().getRequest();

    // Se o usuário não existir (não deveria acontecer se o JwtAuthGuard rodar antes) ou não tiver role, bloqueia
    if (!user || !user.roles?.length) {
      return false;
    }

    // Verifica se alguma das roles do usuário está dentro do array de roles permitidas
    return requiredRoles.some((r: Role) => user.roles.includes(r));
  }
}
