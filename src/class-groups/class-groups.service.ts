import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateClassGroupDto } from './dto/create-class-group.dto';
import { UpdateClassGroupDto } from './dto/update-class-group.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassGroupsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClassGroupDto: CreateClassGroupDto) {
    const { courseId, periodId, institutionId } = createClassGroupDto;

    const [course, period] = await Promise.all([
      this.prisma.course.findFirst({ where: { id: courseId, institutionId } }),
      this.prisma.academicPeriod.findFirst({
        where: { id: periodId, institutionId },
      }),
    ]);

    if (!course)
      throw new UnauthorizedException(
        'Curso inválido ou não pertence à instituição.',
      );
    if (!period)
      throw new UnauthorizedException(
        'Período letivo inválido ou não pertence à instituição.',
      );

    return this.prisma.classGroup.create({
      data: createClassGroupDto as any,
    });
  }

  async findAll(institutionId: string, courseId?: string, periodId?: string) {
    const whereClause: any = { institutionId };

    if (courseId) whereClause.courseId = courseId;
    if (periodId) whereClause.periodId = periodId;

    return this.prisma.classGroup.findMany({
      where: whereClause,
      include: {
        course: { select: { name: true } },
        period: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, institutionId: string) {
    const classGroup = await this.prisma.classGroup.findFirst({
      where: { id, institutionId },
      include: { course: true, period: true },
    });

    if (!classGroup) throw new NotFoundException('Turma não encontrada.');
    return classGroup;
  }

  async update(
    id: string,
    updateClassGroupDto: UpdateClassGroupDto,
    institutionId: string,
  ) {
    await this.findOne(id, institutionId);

    return this.prisma.classGroup.update({
      where: { id },
      data: updateClassGroupDto as any,
    });
  }

  async remove(id: string, institutionId: string) {
    await this.findOne(id, institutionId);
    return this.prisma.classGroup.delete({ where: { id } });
  }
}
