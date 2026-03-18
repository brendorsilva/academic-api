import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class EnrollmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createEnrollmentDto: CreateEnrollmentDto) {
    const { studentId, classGroupId, classSubjectIds, institutionId } =
      createEnrollmentDto;

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
    } else {
      const validSubjects = await this.prisma.classSubject.count({
        where: { id: { in: subjectsToEnroll }, classGroupId, institutionId },
      });

      if (validSubjects !== subjectsToEnroll.length) {
        throw new BadRequestException(
          'Uma ou mais disciplinas enviadas são inválidas para esta turma.',
        );
      }
    }

    return this.prisma.enrollment.create({
      data: {
        institutionId: institutionId!,
        studentId,
        classGroupId,

        subjects: {
          create: subjectsToEnroll.map((subjectId) => ({
            institutionId: institutionId!,

            classSubject: {
              connect: { id: subjectId },
            },
          })),
        },
      },
      include: {
        student: { select: { fullName: true } },
        classGroup: { select: { name: true } },
        subjects: { include: { classSubject: { include: { subject: true } } } },
      },
    });
  }

  async findAll(
    institutionId: string,
    classGroupId?: string,
    studentId?: string,
  ) {
    const whereClause: any = { institutionId };

    if (classGroupId) whereClause.classGroupId = classGroupId;
    if (studentId) whereClause.studentId = studentId;

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

  async findOne(id: string, institutionId: string) {
    const enrollment = await this.prisma.enrollment.findFirst({
      where: { id, institutionId },
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
    return enrollment;
  }

  async remove(id: string, institutionId: string) {
    await this.findOne(id, institutionId);

    await this.prisma.enrollmentSubject.deleteMany({
      where: { enrollmentId: id },
    });

    return this.prisma.enrollment.delete({ where: { id } });
  }
}
