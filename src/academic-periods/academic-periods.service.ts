import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto';
import { UpdateAcademicPeriodDto } from './dto/update-academic-period.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AcademicPeriodsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAcademicPeriodDto: CreateAcademicPeriodDto) {
    return this.prisma.academicPeriod.create({
      data: createAcademicPeriodDto as any,
    });
  }

  async findAll(institutionId: string) {
    return this.prisma.academicPeriod.findMany({
      where: { institutionId },
      orderBy: { startDate: 'desc' },
    });
  }

  async findOne(id: string, institutionId: string) {
    const period = await this.prisma.academicPeriod.findFirst({
      where: { id, institutionId },
    });

    if (!period) {
      throw new NotFoundException('Período letivo não encontrado.');
    }
    return period;
  }

  async update(
    id: string,
    updateAcademicPeriodDto: UpdateAcademicPeriodDto,
    institutionId: string,
  ) {
    await this.findOne(id, institutionId);

    return this.prisma.academicPeriod.update({
      where: { id },
      data: updateAcademicPeriodDto as any,
    });
  }

  async remove(id: string, institutionId: string) {
    await this.findOne(id, institutionId);

    return this.prisma.academicPeriod.delete({
      where: { id },
    });
  }
}
