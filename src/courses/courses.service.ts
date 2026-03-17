import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto) {
    return this.prisma.course.create({
      data: createCourseDto as any,
    });
  }

  async findAll(institutionId: string) {
    return this.prisma.course.findMany({
      where: { institutionId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, institutionId: string) {
    const course = await this.prisma.course.findFirst({
      where: { id, institutionId },
    });

    if (!course) {
      throw new NotFoundException('Curso não encontrado');
    }
    return course;
  }

  async update(
    id: string,
    updateCourseDto: UpdateCourseDto,
    institutionId: string,
  ) {
    await this.findOne(id, institutionId);

    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto as any,
    });
  }

  async remove(id: string, institutionId: string) {
    await this.findOne(id, institutionId);

    return this.prisma.course.delete({
      where: { id },
    });
  }
}
