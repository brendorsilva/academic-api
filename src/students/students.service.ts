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

  async create(createStudentDto: CreateStudentDto, currentUser: any) {
    const institutionId = currentUser.institutionId;

    const existingStudent = await this.prisma.student.findFirst({
      where: {
        institutionId,
        OR: [{ cpf: createStudentDto.cpf }, { email: createStudentDto.email }],
      },
    });

    if (existingStudent) {
      throw new ConflictException(
        'Já existe um aluno registado com este CPF ou Email nesta instituição.',
      );
    }

    return this.prisma.student.create({
      data: {
        ...createStudentDto,
        institutionId,
      } as any,
    });
  }

  async findAll(currentUser: any) {
    const whereClause: any = { institutionId: currentUser.institutionId };

    if (currentUser.role === 'COORDINATOR') {
      whereClause.enrollments = {
        some: {
          classGroup: {
            course: {
              coordinatorId: currentUser.userId,
            },
          },
        },
      };
    }

    return this.prisma.student.findMany({
      where: whereClause,
      orderBy: { fullName: 'asc' },
    });
  }

  async findOne(id: string, currentUser: any) {
    const whereClause: any = { id, institutionId: currentUser.institutionId };

    if (currentUser.role === 'COORDINATOR') {
      whereClause.enrollments = {
        some: {
          classGroup: {
            course: {
              coordinatorId: currentUser.userId,
            },
          },
        },
      };
    }

    const student = await this.prisma.student.findFirst({
      where: whereClause,
    });

    if (!student) {
      throw new NotFoundException(
        'Aluno não encontrado ou você não tem permissão para acessá-lo.',
      );
    }

    return student;
  }

  async update(
    id: string,
    updateStudentDto: UpdateStudentDto,
    currentUser: any,
  ) {
    await this.findOne(id, currentUser);

    return this.prisma.student.update({
      where: { id },
      data: updateStudentDto,
    });
  }

  async remove(id: string, currentUser: any) {
    await this.findOne(id, currentUser);

    return this.prisma.student.delete({
      where: { id },
    });
  }

  async updatePhotoUrl(id: string, photoUrl: string, currentUser: any) {
    await this.findOne(id, currentUser);

    return this.prisma.student.update({
      where: { id },
      data: { photoUrl },
    });
  }
}
