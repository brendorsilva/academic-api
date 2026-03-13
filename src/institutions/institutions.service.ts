// src/institutions/institutions.service.ts
import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class InstitutionsService {
  constructor(private prisma: PrismaService) {}

  async create(createInstitutionDto: CreateInstitutionDto) {
    const institutionExists = await this.prisma.institution.findUnique({
      where: { cnpj: createInstitutionDto.cnpj },
    });

    if (institutionExists) {
      throw new ConflictException(
        'Já existe uma instituição cadastrada com este CNPJ.',
      );
    }

    return this.prisma.institution.create({
      data: createInstitutionDto,
    });
  }

  async findAll() {
    return this.prisma.institution.findMany();
  }

  async findOne(id: string) {
    const institution = await this.prisma.institution.findUnique({
      where: { id },
    });

    if (!institution) {
      throw new NotFoundException('Instituição não encontrada.');
    }

    return institution;
  }

  async update(id: string, updateInstitutionDto: UpdateInstitutionDto) {
    await this.findOne(id);

    return this.prisma.institution.update({
      where: { id },
      data: updateInstitutionDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.institution.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
