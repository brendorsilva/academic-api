import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateGradeDto,
  UpdateGradeDto,
  BatchGradeDto,
} from './dto/create-grades.dto';

// Retorna quantos períodos existem conforme o tipo de avaliação do curso
function getPeriodsCount(evaluationType: string): number {
  switch (evaluationType) {
    case 'TRIMESTRAL':
      return 3;
    case 'SEMESTRAL':
      return 2;
    case 'ANUAL':
      return 1;
    default:
      return 4; // BIMESTRAL
  }
}

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  // 1. Lançar uma nota nova
  async create(createDto: CreateGradeDto, user: any) {
    return this.prisma.$transaction(async (tx) => {
      const grade = await tx.grade.create({
        data: {
          institutionId: user.institutionId,
          enrollmentSubjectId: createDto.enrollmentSubjectId,
          name: createDto.name,
          value: createDto.value,
          weight: createDto.weight || 1.0,
          date: new Date(createDto.date),
          period: createDto.period ?? null,
        },
      });

      await tx.gradeAuditLog.create({
        data: {
          institutionId: user.institutionId,
          gradeId: grade.id,
          userId: user.userId,
          action: 'CREATED',
          newValue: grade.value,
        },
      });

      return grade;
    });
  }

  // 2. Alterar uma nota existente (com auditoria)
  async update(id: string, updateDto: UpdateGradeDto, user: any) {
    const existingGrade = await this.prisma.grade.findUnique({ where: { id } });

    if (!existingGrade || existingGrade.institutionId !== user.institutionId) {
      throw new NotFoundException('Nota não encontrada.');
    }

    return this.prisma.$transaction(async (tx) => {
      const updatedGrade = await tx.grade.update({
        where: { id },
        data: { value: updateDto.value },
      });

      const auditLog = await tx.gradeAuditLog.create({
        data: {
          institutionId: user.institutionId,
          gradeId: updatedGrade.id,
          userId: user.userId,
          action: 'UPDATED',
          oldValue: existingGrade.value,
          newValue: updatedGrade.value,
          reason: updateDto.reason,
        },
        include: {
          user: { select: { name: true, roles: { select: { role: true } } } },
          grade: { select: { name: true, date: true } },
        },
      });

      return { grade: updatedGrade, receipt: auditLog };
    });
  }

  // 3. Excluir uma nota
  async remove(id: string, reason: string, user: any) {
    const existingGrade = await this.prisma.grade.findUnique({ where: { id } });
    if (!existingGrade) throw new NotFoundException('Nota não encontrada.');

    return this.prisma.$transaction(async (tx) => {
      await tx.gradeAuditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.userId,
          action: 'DELETED',
          oldValue: existingGrade.value,
          reason: reason || 'Exclusão manual',
        },
      });

      await tx.grade.delete({ where: { id } });
      return { message: 'Nota excluída com sucesso e auditada.' };
    });
  }

  // 4. Boletim do aluno
  async getStudentBoletim(studentId: string, user: any) {
    if (user.roles?.includes('STUDENT') && user.studentId !== studentId) {
      throw new ForbiddenException(
        'Você só pode visualizar o seu próprio boletim.',
      );
    }

    return this.prisma.enrollmentSubject.findMany({
      where: {
        enrollment: { studentId: studentId },
        institutionId: user.institutionId,
      },
      include: {
        classSubject: {
          include: { subject: true, teacher: true },
        },
        grades: { orderBy: [{ period: 'asc' }, { date: 'asc' }] },
        attendances: true,
      },
    });
  }

  // 5. Caderno de notas (grade book) — visão em grade para lançamento
  async getGradeBook(classSubjectId: string, user: any) {
    const classSubject = await this.prisma.classSubject.findFirst({
      where: {
        id: classSubjectId,
        institutionId: user.institutionId,
      },
      include: {
        subject: true,
        teacher: { select: { id: true, fullName: true } },
        classGroup: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                evaluationType: true,
                level: true,
              },
            },
            period: { select: { id: true, name: true } },
          },
        },
      },
    });

    if (!classSubject) {
      throw new NotFoundException('Disciplina não encontrada.');
    }

    // Professores só acessam disciplinas que lecionam
    if (
      user.roles?.includes('TEACHER') &&
      classSubject.teacherId !== user.teacherId
    ) {
      throw new ForbiddenException(
        'Você não leciona esta disciplina.',
      );
    }

    const evaluationType = classSubject.classGroup.course.evaluationType;
    const periodsCount = getPeriodsCount(evaluationType);

    // Busca todos os alunos matriculados nesta disciplina
    const enrollmentSubjects = await this.prisma.enrollmentSubject.findMany({
      where: {
        classSubjectId,
        institutionId: user.institutionId,
        enrollment: { status: 'ACTIVE' },
      },
      include: {
        enrollment: {
          include: {
            student: {
              select: {
                id: true,
                fullName: true,
                enrollmentNumber: true,
              },
            },
          },
        },
        grades: {
          orderBy: [{ period: 'asc' }, { date: 'asc' }],
        },
      },
      orderBy: {
        enrollment: { student: { fullName: 'asc' } },
      },
    });

    // Monta a estrutura organizada por período para cada aluno
    const students = enrollmentSubjects.map((es) => {
      const periods = Array.from({ length: periodsCount }, (_, i) => {
        const periodNumber = i + 1;
        const periodGrades = es.grades.filter(
          (g) => g.period === periodNumber,
        );

        // Média ponderada do período
        let weightedAverage: number | null = null;
        if (periodGrades.length > 0) {
          const totalWeight = periodGrades.reduce(
            (sum, g) => sum + g.weight,
            0,
          );
          const weightedSum = periodGrades.reduce(
            (sum, g) => sum + g.value * g.weight,
            0,
          );
          weightedAverage =
            totalWeight > 0
              ? Math.round((weightedSum / totalWeight) * 100) / 100
              : null;
        }

        return {
          period: periodNumber,
          grades: periodGrades.map((g) => ({
            id: g.id,
            name: g.name,
            value: g.value,
            weight: g.weight,
            date: g.date,
          })),
          weightedAverage,
        };
      });

      return {
        studentId: es.enrollment.student.id,
        studentName: es.enrollment.student.fullName,
        enrollmentNumber: es.enrollment.student.enrollmentNumber,
        enrollmentSubjectId: es.id,
        subjectStatus: es.status,
        finalGrade: es.finalGrade,
        finalAttendance: es.finalAttendance,
        periods,
      };
    });

    return {
      classSubject: {
        id: classSubject.id,
        room: classSubject.room,
        subject: classSubject.subject,
        classGroup: classSubject.classGroup,
        teacher: classSubject.teacher,
      },
      evaluationType,
      periodsCount,
      totalStudents: students.length,
      students,
    };
  }

  // 6. Lançamento em lote (salva todas as notas de uma avaliação de uma vez)
  async batchUpsert(dto: BatchGradeDto, user: any) {
    // Valida se a classSubject pertence à instituição do usuário
    const classSubject = await this.prisma.classSubject.findFirst({
      where: { id: dto.classSubjectId, institutionId: user.institutionId },
    });

    if (!classSubject) {
      throw new NotFoundException('Disciplina não encontrada.');
    }

    if (
      user.roles?.includes('TEACHER') &&
      classSubject.teacherId !== user.teacherId
    ) {
      throw new ForbiddenException(
        'Você não leciona esta disciplina.',
      );
    }

    const gradeDate = new Date(dto.date);
    const weight = dto.weight ?? 1.0;

    const results = await this.prisma.$transaction(async (tx) => {
      const created: any[] = [];
      const updated: any[] = [];

      for (const item of dto.grades) {
        // Verifica se já existe nota com mesmo nome e período para este aluno
        const existing = await tx.grade.findFirst({
          where: {
            enrollmentSubjectId: item.enrollmentSubjectId,
            name: dto.gradeName,
            period: dto.period,
            institutionId: user.institutionId,
          },
        });

        if (existing) {
          // Atualiza e registra auditoria
          const updatedGrade = await tx.grade.update({
            where: { id: existing.id },
            data: { value: item.value, date: gradeDate },
          });

          await tx.gradeAuditLog.create({
            data: {
              institutionId: user.institutionId,
              gradeId: updatedGrade.id,
              userId: user.userId,
              action: 'UPDATED',
              oldValue: existing.value,
              newValue: item.value,
              reason: 'Lançamento em lote via caderno de notas',
            },
          });

          updated.push(updatedGrade);
        } else {
          // Cria nova nota e registra auditoria
          const newGrade = await tx.grade.create({
            data: {
              institutionId: user.institutionId,
              enrollmentSubjectId: item.enrollmentSubjectId,
              name: dto.gradeName,
              value: item.value,
              weight,
              date: gradeDate,
              period: dto.period,
            },
          });

          await tx.gradeAuditLog.create({
            data: {
              institutionId: user.institutionId,
              gradeId: newGrade.id,
              userId: user.userId,
              action: 'CREATED',
              newValue: item.value,
            },
          });

          created.push(newGrade);
        }
      }

      return {
        message: `Lançamento concluído: ${created.length} criadas, ${updated.length} atualizadas.`,
        created: created.length,
        updated: updated.length,
      };
    });

    return results;
  }
}
