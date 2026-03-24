import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGradeDto, UpdateGradeDto } from './dto/create-grades.dto';

@Injectable()
export class GradesService {
  constructor(private prisma: PrismaService) {}

  // 1. Lançar uma nota nova
  async create(createDto: CreateGradeDto, user: any) {
    return this.prisma.$transaction(async (tx) => {
      // Cria a nota
      const grade = await tx.grade.create({
        data: {
          institutionId: user.institutionId,
          enrollmentSubjectId: createDto.enrollmentSubjectId,
          name: createDto.name,
          value: createDto.value,
          weight: createDto.weight || 1.0,
          date: new Date(createDto.date),
        },
      });

      // Gera o Log de Auditoria (CREATED)
      await tx.gradeAuditLog.create({
        data: {
          institutionId: user.institutionId,
          gradeId: grade.id,
          userId: user.userId, // ID de quem fez o login (Diretor ou Professor)
          action: 'CREATED',
          newValue: grade.value,
        },
      });

      return grade;
    });
  }

  // 2. Alterar uma nota existente (O mais crítico para auditoria)
  async update(id: string, updateDto: UpdateGradeDto, user: any) {
    const existingGrade = await this.prisma.grade.findUnique({ where: { id } });

    if (!existingGrade || existingGrade.institutionId !== user.institutionId) {
      throw new NotFoundException('Nota não encontrada.');
    }

    return this.prisma.$transaction(async (tx) => {
      // Atualiza a nota
      const updatedGrade = await tx.grade.update({
        where: { id },
        data: { value: updateDto.value },
      });

      // Gera o Log de Auditoria (UPDATED) - Guarda o valor antigo e o novo
      const auditLog = await tx.gradeAuditLog.create({
        data: {
          institutionId: user.institutionId,
          gradeId: updatedGrade.id,
          userId: user.sub,
          action: 'UPDATED',
          oldValue: existingGrade.value,
          newValue: updatedGrade.value,
          reason: updateDto.reason,
        },
        include: {
          user: { select: { name: true, role: true } },
          grade: { select: { name: true, date: true } },
        },
      });

      // Retornamos o log junto, pois o Frontend vai usar isso para gerar o PDF do Comprovante na hora!
      return { grade: updatedGrade, receipt: auditLog };
    });
  }

  // 3. Excluir uma nota
  async remove(id: string, reason: string, user: any) {
    const existingGrade = await this.prisma.grade.findUnique({ where: { id } });
    if (!existingGrade) throw new NotFoundException('Nota não encontrada.');

    return this.prisma.$transaction(async (tx) => {
      // Primeiro cria o log de DELETED (antes de apagar a nota, ou guardando o ID nulo caso a relação OnDelete seja SetNull)
      await tx.gradeAuditLog.create({
        data: {
          institutionId: user.institutionId,
          userId: user.sub,
          action: 'DELETED',
          oldValue: existingGrade.value,
          reason: reason || 'Exclusão manual',
        },
      });

      // Depois deleta a nota
      await tx.grade.delete({ where: { id } });
      return { message: 'Nota excluída com sucesso e auditada.' };
    });
  }

  // 4. Buscar o Boletim do Aluno (Usado pelo Aluno no Frontend)
  async getStudentBoletim(studentId: string, user: any) {
    // Garante que o aluno só veja o próprio boletim (ou que o Admin/Teacher veja de qualquer um)
    if (user.role === 'STUDENT' && user.studentId !== studentId) {
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
          include: { subject: true, teacher: true }, // Traz o nome da matéria e do professor
        },
        grades: true, // Traz todas as notas daquela matéria
        attendances: true, // Traz as faltas
      },
    });
  }
}
