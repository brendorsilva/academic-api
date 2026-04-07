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

  async create(createSubjectDto: CreateSubjectDto, currentUser: any) {
    const courseWhere: any = {
      id: createSubjectDto.courseId,
      institutionId: currentUser.institutionId,
    };

    if (currentUser.role === 'COORDINATOR') {
      courseWhere.coordinatorId = currentUser.userId;
    }

    const course = await this.prisma.course.findFirst({
      where: courseWhere,
    });

    if (!course) {
      throw new UnauthorizedException(
        'Curso não encontrado ou não pertence à sua instituição.',
      );
    }

    return this.prisma.subject.create({
      data: {
        ...createSubjectDto,
        institutionId: currentUser.institutionId,
      } as any,
    });
  }

  async findAll(currentUser: any, courseId?: string) {
    const whereClause: any = { institutionId: currentUser.institutionId };
    if (courseId) {
      whereClause.courseId = courseId;
    }

    if (currentUser.role === 'COORDINATOR') {
      whereClause.course = {
        coordinatorId: currentUser.userId,
      };
    }

    return this.prisma.subject.findMany({
      where: whereClause,
      include: { course: { select: { name: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, currentUser: any) {
    const whereClause: any = {
      id,
      institutionId: currentUser.institutionId,
    };

    if (currentUser.role === 'COORDINATOR') {
      whereClause.course = {
        coordinatorId: currentUser.userId,
      };
    }

    const subject = await this.prisma.subject.findFirst({
      where: whereClause,
      include: { course: true },
    });

    if (!subject) throw new NotFoundException('Disciplina não encontrada');
    return subject;
  }

  async update(
    id: string,
    updateSubjectDto: UpdateSubjectDto,
    currentUser: any,
  ) {
    await this.findOne(id, currentUser);

    return this.prisma.subject.update({
      where: { id },
      data: updateSubjectDto as any,
    });
  }

  async remove(id: string, currentUser: any) {
    await this.findOne(id, currentUser);

    return this.prisma.subject.delete({
      where: { id },
    });
  }
}
