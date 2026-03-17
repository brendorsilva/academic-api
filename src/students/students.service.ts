import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class StudentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createStudentDto: CreateStudentDto) {
    // 1. Garantir que a instituição existe
    const institution = await this.prisma.institution.findUnique({
      where: { id: createStudentDto.institutionId },
    });

    if (!institution) {
      throw new NotFoundException('Instituição não encontrada.');
    }

    // 2. Validação de unicidade (CPF ou Email dentro da mesma instituição)
    const existingStudent = await this.prisma.student.findFirst({
      where: {
        institutionId: createStudentDto.institutionId,
        OR: [{ cpf: createStudentDto.cpf }, { email: createStudentDto.email }],
      },
    });

    if (existingStudent) {
      throw new ConflictException(
        'Já existe um aluno registado com este CPF ou Email nesta instituição.',
      );
    }

    return this.prisma.student.create({
      data: createStudentDto as any,
    });
  }

  // O isolamento dos dados exige que filtremos sempre pela instituição
  async findAll(institutionId: string) {
    return this.prisma.student.findMany({
      where: { institutionId },
      orderBy: { fullName: 'asc' }, // Ordenação alfabética por defeito
    });
  }

  async findOne(id: string, institutionId: string) {
    const student = await this.prisma.student.findFirst({
      where: { id, institutionId },
    });

    if (!student) {
      throw new NotFoundException(
        'Aluno não encontrado ou não pertence a esta instituição.',
      );
    }

    return student;
  }

  async update(
    id: string,
    institutionId: string,
    updateStudentDto: UpdateStudentDto,
  ) {
    // Garantimos a existência e o isolamento chamando o findOne primeiro
    await this.findOne(id, institutionId);

    return this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
    });
  }

  async remove(id: string, institutionId: string) {
    // Verificamos novamente se o aluno pertence à instituição antes de apagar
    await this.findOne(id, institutionId);

    return this.prisma.student.delete({
      where: { id },
    });
  }

  async updatePhotoUrl(id: string, institutionId: string, photoUrl: string) {
    // Valida se o aluno existe e pertence à instituição
    await this.findOne(id, institutionId);

    return this.prisma.student.update({
      where: { id },
      data: { photoUrl },
    });
  }
}
