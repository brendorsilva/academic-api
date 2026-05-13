import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateClassSubjectDto } from './dto/create-class-subject.dto';
import { UpdateClassSubjectDto } from './dto/update-class-subject.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassSubjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClassSubjectDto: CreateClassSubjectDto, currentUser: any) {
    const { classGroupId, subjectId, totalSeats } = createClassSubjectDto;
    const institutionId = currentUser.institutionId;

    const classGroupWhere: any = { id: classGroupId, institutionId };
    const subjectWhere: any = { id: subjectId, institutionId };

    if (currentUser.roles?.includes('COORDINATOR') && !currentUser.roles?.includes('ADMIN')) {
      classGroupWhere.course = { coordinatorId: currentUser.userId };
      subjectWhere.course = { coordinatorId: currentUser.userId };
    }

    const [classGroup, subject] = await Promise.all([
      this.prisma.classGroup.findFirst({ where: classGroupWhere }),
      this.prisma.subject.findFirst({ where: subjectWhere }),
    ]);

    if (!classGroup)
      throw new UnauthorizedException(
        'Turma inválida, não pertence à instituição ou você não tem permissão para acessá-la.',
      );
    if (!subject)
      throw new UnauthorizedException(
        'Disciplina inválida, não pertence à instituição ou você não tem permissão para acessá-la.',
      );

    return this.prisma.$transaction(async (tx) => {
      const newClassSubject = await tx.classSubject.create({
        data: {
          ...createClassSubjectDto,
          institutionId,
        } as any,
      });

      const existingEnrollments = await tx.enrollment.findMany({
        where: {
          classGroupId: classGroupId,
          institutionId: institutionId,
          status: 'ACTIVE',
        },
      });

      if (existingEnrollments.length > 0) {
        if (totalSeats && existingEnrollments.length > totalSeats) {
          throw new BadRequestException(
            `A turma já possui ${existingEnrollments.length} alunos matriculados, o que excede o limite de ${totalSeats} vagas desta nova oferta.`,
          );
        }

        const enrollmentsData = existingEnrollments.map((enrollment) => ({
          institutionId: institutionId,
          enrollmentId: enrollment.id,
          classSubjectId: newClassSubject.id,
          status: 'STUDYING' as any,
        }));

        await tx.enrollmentSubject.createMany({
          data: enrollmentsData,
        });

        await tx.classSubject.update({
          where: { id: newClassSubject.id },
          data: { occupiedSeats: existingEnrollments.length },
        });

        newClassSubject.occupiedSeats = existingEnrollments.length;
      }

      return newClassSubject;
    });
  }

  async findAll(currentUser: any, classGroupId?: string) {
    const whereClause: any = { institutionId: currentUser.institutionId };

    if (classGroupId) whereClause.classGroupId = classGroupId;

    if (currentUser.roles?.includes('COORDINATOR') && !currentUser.roles?.includes('ADMIN')) {
      whereClause.classGroup = {
        course: { coordinatorId: currentUser.userId },
      };
    }

    return this.prisma.classSubject.findMany({
      where: whereClause,
      include: {
        subject: { select: { name: true, workload: true } },
        classGroup: { select: { name: true } },
        teacher: { select: { fullName: true } },
      },
    });
  }

  async findOne(id: string, currentUser: any) {
    const whereClause: any = {
      id,
      institutionId: currentUser.institutionId,
    };

    if (currentUser.roles?.includes('COORDINATOR') && !currentUser.roles?.includes('ADMIN')) {
      whereClause.classGroup = {
        course: { coordinatorId: currentUser.userId },
      };
    }

    const classSubject = await this.prisma.classSubject.findFirst({
      where: whereClause,
      include: {
        subject: true,
        classGroup: true,
        teacher: true,
        studentSubjects: {
          include: {
            enrollment: {
              include: {
                student: true,
              },
            },
            grades: true,
          },
        },
      },
    });

    if (!classSubject) {
      throw new NotFoundException(
        'Oferta de disciplina não encontrada ou sem permissão de acesso.',
      );
    }

    return classSubject;
  }

  async update(
    id: string,
    updateClassSubjectDto: UpdateClassSubjectDto,
    currentUser: any,
  ) {
    await this.findOne(id, currentUser);

    return this.prisma.classSubject.update({
      where: { id },
      data: updateClassSubjectDto as any,
    });
  }

  async remove(id: string, currentUser: any) {
    await this.findOne(id, currentUser);
    return this.prisma.classSubject.delete({ where: { id } });
  }
}
