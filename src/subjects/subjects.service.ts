import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createSubjectDto: CreateSubjectDto) {
    const course = await this.prisma.course.findFirst({
      where: {
        id: createSubjectDto.courseId,
        institutionId: createSubjectDto.institutionId,
      },
    });

    if (!course) {
      throw new UnauthorizedException(
        'Curso não encontrado ou não pertence à sua instituição.',
      );
    }

    return this.prisma.subject.create({
      data: createSubjectDto as any,
    });
  }

  async findAll(institutionId: string, courseId?: string) {
    const whereClause: any = { institutionId };
    if (courseId) {
      whereClause.courseId = courseId;
    }

    return this.prisma.subject.findMany({
      where: whereClause,
      include: { course: { select: { name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, institutionId: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { id, institutionId },
      include: { course: true },
    });

    if (!subject) throw new NotFoundException('Disciplina não encontrada');
    return subject;
  }

  async update(
    id: string,
    updateSubjectDto: UpdateSubjectDto,
    institutionId: string,
  ) {
    await this.findOne(id, institutionId);

    return this.prisma.subject.update({
      where: { id },
      data: updateSubjectDto as any,
    });
  }

  async remove(id: string, institutionId: string) {
    await this.findOne(id, institutionId);

    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
