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
    const institutionId = user.institutionId; // Usa sempre a instituição do usuário logado

    const [student, classGroup] = await Promise.all([
      this.prisma.student.findFirst({
        where: { id: studentId, institutionId },
      }),
      this.prisma.classGroup.findFirst({
        where: { id: classGroupId, institutionId },
      }),
    ]);

    if (!student) throw new UnauthorizedException('Aluno não encontrado.');
    if (!classGroup) throw new UnauthorizedException('Turma não encontrada.');

    // 1. Define as disciplinas a matricular
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

    // 2. Valida se as disciplinas existem e se há vagas
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

    // 3. Executa a matrícula e incrementa as vagas em uma transação segura
    return this.prisma.$transaction(async (tx) => {
      // Cria a matrícula e vincula as disciplinas
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

      // Incrementa os assentos ocupados nas ofertas de disciplina
      await tx.classSubject.updateMany({
        where: { id: { in: subjectsToEnroll }, institutionId },
        data: { occupiedSeats: { increment: 1 } },
      });

      return enrollment;
    });
  }

  async findAll(user: any, classGroupId?: string, studentId?: string) {
    const whereClause: any = { institutionId: user.institutionId };

    // Regra de RBAC: Se for aluno, só pode ver as próprias matrículas
    if (user.role === 'STUDENT') {
      whereClause.studentId = user.studentId;
    } else if (studentId) {
      whereClause.studentId = studentId;
    }

    if (classGroupId) whereClause.classGroupId = classGroupId;

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
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id, institutionId: user.institutionId },
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

    if (!enrollment) throw new NotFoundException('Matrícula não encontrada.');

    // Impede que um aluno acesse a matrícula de outro pela URL
    if (user.role === 'STUDENT' && enrollment.studentId !== user.studentId) {
      throw new ForbiddenException('Acesso negado a esta matrícula.');
    }

    return enrollment;
  }

  async remove(id: string, user: any) {
    const enrollment = await this.findOne(id, user);

    const subjectIdsToFree = enrollment.subjects.map((s) => s.classSubjectId);

    // Usa transação para remover a matrícula e devolver as vagas
    return this.prisma.$transaction(async (tx) => {
      // 1. Remove as disciplinas do aluno
      await tx.enrollmentSubject.deleteMany({
        where: { enrollmentId: id },
      });

      // 2. Remove a matrícula principal
      await tx.enrollment.delete({ where: { id } });

      // 3. Libera as vagas devolvendo-as para a turma
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
