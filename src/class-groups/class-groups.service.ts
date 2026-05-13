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

  async create(createClassGroupDto: CreateClassGroupDto, currentUser: any) {
    const { courseId, periodId } = createClassGroupDto;
    const institutionId = currentUser.institutionId;

    const courseWhere: any = { id: courseId, institutionId };
    if (currentUser.roles?.includes('COORDINATOR') && !currentUser.roles?.includes('ADMIN')) {
      courseWhere.coordinatorId = currentUser.userId;
    }

    const [course, period] = await Promise.all([
      this.prisma.course.findFirst({ where: courseWhere }),
      this.prisma.academicPeriod.findFirst({
        where: { id: periodId, institutionId },
      }),
    ]);

    if (!course)
      throw new UnauthorizedException(
        'Curso inválido ou você não tem permissão para gerenciar turmas deste curso.',
      );
    if (!period)
      throw new UnauthorizedException(
        'Período letivo inválido ou não pertence à instituição.',
      );

    return this.prisma.classGroup.create({
      data: {
        ...createClassGroupDto,
        institutionId,
      } as any,
    });
  }

  async findAll(currentUser: any, courseId?: string, periodId?: string) {
    const whereClause: any = { institutionId: currentUser.institutionId };

    if (courseId) whereClause.courseId = courseId;
    if (periodId) whereClause.periodId = periodId;

    if (currentUser.roles?.includes('COORDINATOR') && !currentUser.roles?.includes('ADMIN')) {
      whereClause.course = {
        coordinatorId: currentUser.userId,
      };
    }

    return this.prisma.classGroup.findMany({
      where: whereClause,
      include: {
        course: { select: { name: true } },
        period: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, currentUser: any) {
    const whereClause: any = {
      id,
      institutionId: currentUser.institutionId,
    };

    if (currentUser.roles?.includes('COORDINATOR') && !currentUser.roles?.includes('ADMIN')) {
      whereClause.course = { coordinatorId: currentUser.userId };
    }

    const classGroup = await this.prisma.classGroup.findFirst({
      where: whereClause,
      include: { course: true, period: true },
    });

    if (!classGroup)
      throw new NotFoundException(
        'Turma não encontrada ou sem permissão de acesso.',
      );
    return classGroup;
  }

  async update(
    id: string,
    updateClassGroupDto: UpdateClassGroupDto,
    currentUser: any,
  ) {
    await this.findOne(id, currentUser);

    return this.prisma.classGroup.update({
      where: { id },
      data: updateClassGroupDto as any,
    });
  }

  async remove(id: string, currentUser: any) {
    await this.findOne(id, currentUser);

    return this.prisma.classGroup.delete({ where: { id } });
  }
}
