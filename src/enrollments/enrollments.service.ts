import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEnrollmentDto: CreateEnrollmentDto, user: any) {
    const { studentId, classGroupId, classSubjectIds } = createEnrollmentDto;
    const institutionId = user.institutionId;

    const classGroupWhere: any = { id: classGroupId, institutionId };
    if (user.role === 'COORDINATOR') {
      classGroupWhere.course = { coordinatorId: user.userId };
    }

    const [student, classGroup] = await Promise.all([
      this.prisma.student.findFirst({
        where: { id: studentId, institutionId },
      }),
      this.prisma.classGroup.findFirst({
        where: classGroupWhere,
      }),
    ]);

    if (!student) throw new UnauthorizedException('Aluno não encontrado.');
    if (!classGroup)
      throw new UnauthorizedException(
        'Turma não encontrada ou você não tem permissão para acessá-la.',
      );

    let subjectsToEnroll = classSubjectIds;

    if (!subjectsToEnroll || subjectsToEnroll.length === 0) {
      const classSubjects = await this.prisma.classSubject.findMany({
        where: { classGroupId, institutionId },
      });

      if (classSubjects.length === 0) {
        throw new BadRequestException(
          'Esta turma ainda não tem disciplinas ofertadas. Impossível matricular.',
        );
      }
      subjectsToEnroll = classSubjects.map((cs) => cs.id);
    }

    const validSubjects = await this.prisma.classSubject.findMany({
      where: { id: { in: subjectsToEnroll }, classGroupId, institutionId },
    });

    if (validSubjects.length !== subjectsToEnroll.length) {
      throw new BadRequestException(
        'Uma ou mais disciplinas enviadas são inválidas para esta turma.',
      );
    }

    for (const subject of validSubjects) {
      if (subject.occupiedSeats >= subject.totalSeats) {
        throw new BadRequestException(
          `A disciplina com ID ${subject.id} não possui vagas disponíveis (Limite: ${subject.totalSeats}).`,
        );
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const enrollment = await tx.enrollment.create({
        data: {
          institutionId,
          studentId,
          classGroupId,
          subjects: {
            create: subjectsToEnroll.map((subjectId) => ({
              institutionId,
              classSubject: { connect: { id: subjectId } },
            })),
          },
        },
        include: {
          student: { select: { fullName: true } },
          classGroup: { select: { name: true } },
          subjects: {
            include: { classSubject: { include: { subject: true } } },
          },
        },
      });

      await tx.classSubject.updateMany({
        where: { id: { in: subjectsToEnroll }, institutionId },
        data: { occupiedSeats: { increment: 1 } },
      });

      return enrollment;
    });
  }

  async findAll(user: any, classGroupId?: string, studentId?: string) {
    const whereClause: any = { institutionId: user.institutionId };

    if (user.role === 'STUDENT') {
      whereClause.studentId = user.studentId;
    } else if (studentId) {
      whereClause.studentId = studentId;
    }

    if (classGroupId) whereClause.classGroupId = classGroupId;

    if (user.role === 'COORDINATOR') {
      whereClause.classGroup = {
        course: { coordinatorId: user.userId },
      };
    }

    return this.prisma.enrollment.findMany({
      where: whereClause,
      include: {
        student: { select: { fullName: true, cpf: true } },
        classGroup: {
          select: {
            name: true,
            period: true,
          },
        },
      },
      orderBy: { enrollmentDate: 'desc' },
    });
  }

  async findOne(id: string, user: any) {
    const whereClause: any = { id, institutionId: user.institutionId };

    if (user.role === 'COORDINATOR') {
      whereClause.classGroup = {
        course: { coordinatorId: user.userId },
      };
    }

    const enrollment = await this.prisma.enrollment.findFirst({
      where: whereClause,
      include: {
        student: true,
        classGroup: { include: { course: true, period: true } },
        subjects: {
          include: {
            classSubject: { include: { subject: true, classGroup: true } },
          },
        },
      },
    });

    if (!enrollment)
      throw new NotFoundException(
        'Matrícula não encontrada ou sem permissão de acesso.',
      );

    if (user.role === 'STUDENT' && enrollment.studentId !== user.studentId) {
      throw new ForbiddenException('Acesso negado a esta matrícula.');
    }

    return enrollment;
  }

  async remove(id: string, user: any) {
    const enrollment = await this.findOne(id, user);

    const subjectIdsToFree = enrollment.subjects.map((s) => s.classSubjectId);

    return this.prisma.$transaction(async (tx) => {
      await tx.attendance.deleteMany({
        where: {
          enrollmentSubject: {
            enrollmentId: id,
          },
        },
      });

      await tx.enrollmentSubject.deleteMany({
        where: { enrollmentId: id },
      });

      await tx.enrollment.delete({ where: { id } });

      if (subjectIdsToFree.length > 0) {
        await tx.classSubject.updateMany({
          where: {
            id: { in: subjectIdsToFree },
            institutionId: user.institutionId,
          },
          data: { occupiedSeats: { decrement: 1 } },
        });
      }

      return { message: 'Matrícula removida com sucesso. Vagas liberadas.' };
    });
  }
}
