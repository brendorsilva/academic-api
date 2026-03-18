import {
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
    const { classGroupId, subjectId, institutionId } = createClassSubjectDto;

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

    return this.prisma.classSubject.create({
      data: createClassSubjectDto as any,
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
      },
    });
  }

  async findOne(id: string, institutionId: string) {
    const classSubject = await this.prisma.classSubject.findFirst({
      where: { id, institutionId },
      include: { subject: true, classGroup: true },
    });

    if (!classSubject)
      throw new NotFoundException('Oferta de disciplina não encontrada.');
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
