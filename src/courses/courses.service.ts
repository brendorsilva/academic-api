import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createCourseDto: CreateCourseDto, currentUser: any) {
    const data: any = {
      ...createCourseDto,
      institutionId: currentUser.institutionId,
    };

    if (currentUser.role === 'COORDINATOR') {
      data.coordinatorId = currentUser.userId;
    }

    return this.prisma.course.create({
      data,
    });
  }

  async findAll(currentUser: any) {
    const whereClause: any = { institutionId: currentUser.institutionId };

    if (currentUser.role === 'COORDINATOR') {
      whereClause.coordinatorId = currentUser.userId;
    }

    return this.prisma.course.findMany({
      where: whereClause,
      include: {
        coordinator: { select: { id: true, name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, currentUser: any) {
    const whereClause: any = { id, institutionId: currentUser.institutionId };

    if (currentUser.role === 'COORDINATOR') {
      whereClause.coordinatorId = currentUser.userId;
    }

    const course = await this.prisma.course.findFirst({
      where: whereClause,
      include: {
        coordinator: { select: { id: true, name: true } },
      },
    });

    if (!course) {
      throw new NotFoundException(
        'Curso não encontrado ou sem permissão de acesso',
      );
    }
    return course;
  }

  async update(id: string, updateCourseDto: UpdateCourseDto, currentUser: any) {
    await this.findOne(id, currentUser);

    return this.prisma.course.update({
      where: { id },
      data: updateCourseDto as any,
    });
  }

  async remove(id: string, currentUser: any) {
    await this.findOne(id, currentUser);

    return this.prisma.course.delete({
      where: { id },
    });
  }
}
