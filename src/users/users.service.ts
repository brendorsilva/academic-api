import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserAccessDto } from './dto/create-user-access.dto';
import { CreateCoordinatorDto } from './dto/create-coordinator.dto';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, institutionId } = createUserDto;

    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      throw new NotFoundException('Instituição não encontrada.');
    }

    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new ConflictException('Este e-mail já está cadastrado.');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        institutionId,
        roles: { create: { role: Role.ADMIN } },
      },
    });

    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async generateAccess(dto: CreateUserAccessDto, currentUser: any) {
    const { profileId, role, email, password } = dto;
    const institutionId = currentUser.institutionId;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const whereClause: any = { institutionId };
    if (role === 'TEACHER') whereClause.teacherId = profileId;
    if (role === 'STUDENT') whereClause.studentId = profileId;

    const existingUser = await this.prisma.user.findFirst({
      where: whereClause,
    });

    if (existingUser) {
      const updatedUser = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email,
          password: hashedPassword,
          mustChangePassword: true,
        },
      });
      return {
        message: 'Senha resetada e acesso atualizado com sucesso.',
        user: updatedUser,
      };
    }

    let profileName = '';
    if (role === 'TEACHER') {
      const teacher = await this.prisma.teacher.findFirst({
        where: { id: profileId, institutionId },
      });
      if (!teacher) throw new NotFoundException('Professor não encontrado.');
      profileName = teacher.fullName;
    } else if (role === 'STUDENT') {
      const student = await this.prisma.student.findFirst({
        where: { id: profileId, institutionId },
      });
      if (!student) throw new NotFoundException('Aluno não encontrado.');
      profileName = student.fullName;
    }

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: profileName,
        institutionId,
        teacherId: role === 'TEACHER' ? profileId : null,
        studentId: role === 'STUDENT' ? profileId : null,
        mustChangePassword: true,
        roles: { create: { role } },
      },
      select: {
        id: true,
        email: true,
        name: true,
        roles: { select: { role: true } },
      },
    });

    return newUser;
  }

  async findAll(currentUser: any) {
    return this.prisma.user.findMany({
      where: { institutionId: currentUser.institutionId },
      select: {
        id: true,
        name: true,
        email: true,
        teacherId: true,
        roles: { select: { role: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async linkTeacher(userId: string, teacherId: string, currentUser: any) {
    const [user, teacher] = await Promise.all([
      this.prisma.user.findFirst({
        where: { id: userId, institutionId: currentUser.institutionId },
      }),
      this.prisma.teacher.findFirst({
        where: { id: teacherId, institutionId: currentUser.institutionId },
      }),
    ]);

    if (!user) throw new NotFoundException('Utilizador não encontrado.');
    if (!teacher) throw new NotFoundException('Professor não encontrado.');

    if (user.teacherId) {
      throw new ConflictException(
        'Este utilizador já está vinculado a um perfil de professor.',
      );
    }

    const existingLink = await this.prisma.user.findUnique({
      where: { teacherId },
    });
    if (existingLink) {
      throw new ConflictException(
        'Este perfil de professor já está vinculado a outro utilizador.',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { teacherId },
      });

      await tx.userRole.upsert({
        where: { userId_role: { userId, role: Role.TEACHER } },
        create: { userId, role: Role.TEACHER },
        update: {},
      });

      return { message: 'Utilizador vinculado ao perfil de professor com sucesso.' };
    });
  }

  async listCoordinators(currentUser: any) {
    return this.prisma.user.findMany({
      where: {
        institutionId: currentUser.institutionId,
        roles: { some: { role: 'COORDINATOR' } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        roles: { select: { role: true } },
      },
    });
  }

  async removeCoordinator(id: string, currentUser: any) {
    const coordinator = await this.prisma.user.findFirst({
      where: {
        id,
        institutionId: currentUser.institutionId,
        roles: { some: { role: 'COORDINATOR' } },
      },
    });

    if (!coordinator) {
      throw new NotFoundException('Coordenador não encontrado.');
    }

    await this.prisma.userRole.delete({
      where: { userId_role: { userId: id, role: 'COORDINATOR' } },
    });
  }

  async createCoordinator(dto: CreateCoordinatorDto, currentUser: any) {
    const { name, email, password } = dto;
    const institutionId = currentUser.institutionId;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Este e-mail já está em uso por outro utilizador.',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newCoordinator = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        institutionId,
        mustChangePassword: true,
        roles: { create: { role: Role.COORDINATOR } },
      },
      select: {
        id: true,
        name: true,
        email: true,
        roles: { select: { role: true } },
      },
    });

    return {
      message: 'Coordenador criado com sucesso!',
      user: newCoordinator,
    };
  }

  async addRole(userId: string, role: Role, currentUser: any) {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, institutionId: currentUser.institutionId },
    });

    if (!user) throw new NotFoundException('Utilizador não encontrado.');

    const existing = await this.prisma.userRole.findUnique({
      where: { userId_role: { userId, role } },
    });

    if (existing) {
      throw new ConflictException('Utilizador já possui esta role.');
    }

    return this.prisma.userRole.create({ data: { userId, role } });
  }

  async removeRole(userId: string, role: Role, currentUser: any) {
    const user = await this.prisma.user.findFirst({
      where: {
        id: userId,
        institutionId: currentUser.institutionId,
        roles: { some: { role } },
      },
      include: { roles: true },
    });

    if (!user) throw new NotFoundException('Utilizador ou role não encontrada.');

    if (user.roles.length === 1) {
      throw new BadRequestException(
        'Não é possível remover a única role do utilizador.',
      );
    }

    await this.prisma.userRole.delete({
      where: { userId_role: { userId, role } },
    });
  }

  async updatePassword(userId: string, newPassword: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return { message: 'Senha atualizada com sucesso.' };
  }
}
