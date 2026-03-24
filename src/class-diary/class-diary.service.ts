import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateClassDiaryDto } from './dto/create-class-diary.dto';
import { UpdateAttendancesDto } from './dto/update-attendance.dto';

@Injectable()
export class ClassDiaryService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createDto: CreateClassDiaryDto, user: any) {
    const classSubject = await this.prisma.classSubject.findUnique({
      where: { id: createDto.classSubjectId },
      include: { studentSubjects: true },
    });

    if (!classSubject || classSubject.institutionId !== user.institutionId) {
      throw new NotFoundException('Turma/Disciplina não encontrada.');
    }

    if (user.role === 'TEACHER' && classSubject.teacherId !== user.teacherId) {
      throw new ForbiddenException(
        'Você não tem permissão para lançar diário nesta turma.',
      );
    }

    const diary = await this.prisma.classDiary.create({
      data: {
        institutionId: user.institutionId,
        classSubjectId: createDto.classSubjectId,
        date: new Date(createDto.date),
        content: createDto.content,
        attendances: {
          create: classSubject.studentSubjects.map((student) => ({
            institutionId: user.institutionId,
            enrollmentSubjectId: student.id,
            isPresent: true,
          })),
        },
      },
      include: {
        attendances: {
          include: {
            enrollmentSubject: {
              include: {
                enrollment: { include: { student: true } },
              },
            },
          },
        },
      },
    });

    return diary;
  }

  async updateAttendances(
    diaryId: string,
    updateDto: UpdateAttendancesDto,
    user: any,
  ) {
    const updates = updateDto.attendances.map((att) =>
      this.prisma.attendance.updateMany({
        where: {
          classDiaryId: diaryId,
          enrollmentSubjectId: att.enrollmentSubjectId,
          institutionId: user.institutionId,
        },
        data: {
          isPresent: att.isPresent,
          justification: att.justification,
        },
      }),
    );

    await this.prisma.$transaction(updates);

    return { message: 'Frequências atualizadas com sucesso!' };
  }

  async findByClassSubject(classSubjectId: string, user: any) {
    return this.prisma.classDiary.findMany({
      where: {
        classSubjectId,
        institutionId: user.institutionId,
      },
      orderBy: { date: 'desc' }, // Aulas mais recentes primeiro

      // ADICIONE ESTE BLOCO INCLUDE: É ele que traz os alunos para o frontend!
      include: {
        attendances: {
          include: {
            enrollmentSubject: {
              include: {
                enrollment: {
                  include: {
                    student: true, // Traz os dados do aluno (nome, etc)
                  },
                },
              },
            },
          },
        },
      },
    });
  }
}
