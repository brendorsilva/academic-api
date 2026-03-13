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

  async create(createTeacherDto: CreateTeacherDto) {
    // Validação de unicidade (CPF ou Email dentro da mesma instituição)
    const existingTeacher = await this.prisma.teacher.findFirst({
      where: {
        institutionId: createTeacherDto.institutionId,
        OR: [{ cpf: createTeacherDto.cpf }, { email: createTeacherDto.email }],
      },
    });

    if (existingTeacher) {
      throw new ConflictException(
        'Já existe um professor cadastrado com este CPF ou E-mail nesta instituição.',
      );
    }

    return this.prisma.teacher.create({
      data: createTeacherDto as any, // Cast necessário devido à injeção condicional do institutionId
    });
  }

  async findAll(institutionId: string) {
    return this.prisma.teacher.findMany({
      where: { institutionId },
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string, institutionId: string) {
    const teacher = await this.prisma.teacher.findFirst({
      where: { id, institutionId },
    });

    if (!teacher) {
      throw new NotFoundException(
        'Professor não encontrado ou não pertence a esta instituição.',
      );
    }

    return teacher;
  }

  async update(
    id: string,
    institutionId: string,
    updateTeacherDto: UpdateTeacherDto,
  ) {
    await this.findOne(id, institutionId);

    return this.prisma.teacher.update({
      where: { id },
      data: updateTeacherDto,
    });
  }

  async remove(id: string, institutionId: string) {
    await this.findOne(id, institutionId);

    // Soft delete: Apenas inativamos o professor em vez de excluí-lo fisicamente
    return this.prisma.teacher.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updatePhotoUrl(id: string, institutionId: string, photoUrl: string) {
    await this.findOne(id, institutionId);

    return this.prisma.teacher.update({
      where: { id },
      data: { photoUrl },
    });
  }
}
