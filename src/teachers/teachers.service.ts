import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TeachersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTeacherDto: CreateTeacherDto, currentUser: any) {
    const institutionId = currentUser.institutionId;

    const existingTeacher = await this.prisma.teacher.findFirst({
      where: {
        institutionId,
        OR: [{ cpf: createTeacherDto.cpf }, { email: createTeacherDto.email }],
      },
    });

    if (existingTeacher) {
      throw new ConflictException(
        'Já existe um professor cadastrado com este CPF ou E-mail nesta instituição.',
      );
    }

    return this.prisma.teacher.create({
      data: {
        ...createTeacherDto,
        institutionId,
      } as any,
    });
  }

  async findAll(currentUser: any) {
    const whereClause: any = { institutionId: currentUser.institutionId };

    if (currentUser.role === 'COORDINATOR') {
      whereClause.classSubjects = {
        some: {
          classGroup: {
            course: {
              coordinatorId: currentUser.userId,
            },
          },
        },
      };
    }

    return this.prisma.teacher.findMany({
      where: { ...whereClause, isActive: true },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string, currentUser: any) {
    const whereClause: any = { id, institutionId: currentUser.institutionId };

    if (currentUser.role === 'COORDINATOR') {
      whereClause.classSubjects = {
        some: {
          classGroup: {
            course: {
              coordinatorId: currentUser.userId,
            },
          },
        },
      };
    }

    const teacher = await this.prisma.teacher.findFirst({
      where: { ...whereClause, isActive: true },
    });

    if (!teacher) {
      throw new NotFoundException(
        'Professor não encontrado ou você não tem permissão para aceder aos dados deste professor.',
      );
    }

    return teacher;
  }

  async update(
    id: string,
    updateTeacherDto: UpdateTeacherDto,
    currentUser: any,
  ) {
    await this.findOne(id, currentUser);

    return this.prisma.teacher.update({
      where: { id },
      data: updateTeacherDto,
    });
  }

  async remove(id: string, currentUser: any) {
    await this.findOne(id, currentUser);

    return this.prisma.teacher.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updatePhotoUrl(id: string, photoUrl: string, currentUser: any) {
    await this.findOne(id, currentUser);

    return this.prisma.teacher.update({
      where: { id },
      data: { photoUrl },
    });
  }
}
