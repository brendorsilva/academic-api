import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client'; // Importa o Enum do Prisma

export const ROLES_KEY = 'roles';
// O decorator recebe uma lista de roles permitidas
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
