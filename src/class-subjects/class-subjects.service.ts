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

  async create(createClassSubjectDto: CreateClassSubjectDto) {
    const { classGroupId, subjectId, institutionId, totalSeats } =
      createClassSubjectDto;

    const [classGroup, subject] = await Promise.all([
      this.prisma.classGroup.findFirst({
        where: { id: classGroupId, institutionId },
      }),
      this.prisma.subject.findFirst({
        where: { id: subjectId, institutionId },
      }),
    ]);

    if (!classGroup)
      throw new UnauthorizedException(
        'Turma inválida ou não pertence à instituição.',
      );
    if (!subject)
      throw new UnauthorizedException(
        'Disciplina inválida ou não pertence à instituição.',
      );

    return this.prisma.$transaction(async (tx) => {
      // Passo A: Cria a oferta da disciplina
      const newClassSubject = await tx.classSubject.create({
        data: createClassSubjectDto as any,
      });

      // Passo B: Busca os alunos que JÁ ESTÃO matriculados nessa Turma (Ex: o Brendo)
      const existingEnrollments = await tx.enrollment.findMany({
        where: {
          classGroupId: classGroupId,
          institutionId: institutionId,
          status: 'ACTIVE', // Garante que pega apenas matrículas ativas
        },
      });

      // Passo C: Se a turma já tiver alunos, matricula eles na nova disciplina automaticamente
      if (existingEnrollments.length > 0) {
        // Trava de segurança: Verifica se a sala comporta os alunos que já estão lá
        if (totalSeats && existingEnrollments.length > totalSeats) {
          throw new BadRequestException(
            `A turma já possui ${existingEnrollments.length} alunos matriculados, o que excede o limite de ${totalSeats} vagas desta nova oferta.`,
          );
        }

        // Prepara os dados para vincular todos os alunos de uma vez
        const enrollmentsData = existingEnrollments.map((enrollment) => ({
          institutionId: institutionId!,
          enrollmentId: enrollment.id,
          classSubjectId: newClassSubject.id,
          status: 'STUDYING' as any,
        }));

        // Cria os vínculos (Isso é o que faz o aluno aparecer na tela do professor)
        await tx.enrollmentSubject.createMany({
          data: enrollmentsData,
        });

        // Atualiza as vagas ocupadas na nova disciplina para refletir a realidade
        await tx.classSubject.update({
          where: { id: newClassSubject.id },
          data: { occupiedSeats: existingEnrollments.length },
        });

        // Atualiza o objeto de retorno
        newClassSubject.occupiedSeats = existingEnrollments.length;
      }

      return newClassSubject;
    });
  }

  async findAll(institutionId: string, classGroupId?: string) {
    const whereClause: any = { institutionId };

    if (classGroupId) whereClause.classGroupId = classGroupId;

    return this.prisma.classSubject.findMany({
      where: whereClause,
      include: {
        subject: { select: { name: true, workload: true } },
        classGroup: { select: { name: true } },
        teacher: { select: { fullName: true } },
      },
    });
  }

  async findOne(id: string, institutionId: string) {
    const classSubject = await this.prisma.classSubject.findFirst({
      where: {
        id,
        institutionId: institutionId,
      },
      include: {
        subject: true,
        classGroup: true,
        teacher: true,
        studentSubjects: {
          include: {
            enrollment: {
              include: {
                student: true, // Traz o nome e os dados do aluno
              },
            },
            grades: true, // Traz as notas já lançadas para o boletim
          },
        },
      },
    });

    if (!classSubject) {
      throw new NotFoundException('Oferta de disciplina não encontrada.');
    }

    return classSubject;
  }

  async update(
    id: string,
    updateClassSubjectDto: UpdateClassSubjectDto,
    institutionId: string,
  ) {
    await this.findOne(id, institutionId);

    return this.prisma.classSubject.update({
      where: { id },
      data: updateClassSubjectDto as any,
    });
  }

  async remove(id: string, institutionId: string) {
    await this.findOne(id, institutionId);
    return this.prisma.classSubject.delete({ where: { id } });
  }
}
