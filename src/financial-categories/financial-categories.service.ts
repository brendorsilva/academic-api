import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFinancialCategoryDto,
  UpdateFinancialCategoryDto,
} from './dto/create-financial-category.dto';
import { TransactionType } from '@prisma/client';

@Injectable()
export class FinancialCategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFinancialCategoryDto, user: any) {
    return this.prisma.financialCategory.create({
      data: {
        institutionId: user.institutionId,
        name: dto.name,
        description: dto.description,
        type: dto.type,
        isActive: dto.isActive ?? true,
      },
    });
  }

  async findAll(user: any, type?: TransactionType) {
    return this.prisma.financialCategory.findMany({
      where: {
        institutionId: user.institutionId,
        ...(type ? { type } : {}),
      },
      orderBy: [{ type: 'asc' }, { name: 'asc' }],
    });
  }

  async findOne(id: string, user: any) {
    const category = await this.prisma.financialCategory.findFirst({
      where: { id, institutionId: user.institutionId },
    });
    if (!category) throw new NotFoundException('Categoria não encontrada.');
    return category;
  }

  async update(id: string, dto: UpdateFinancialCategoryDto, user: any) {
    await this.findOne(id, user);
    return this.prisma.financialCategory.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);

    const hasTransactions = await this.prisma.financialTransaction.count({
      where: { categoryId: id },
    });
    if (hasTransactions > 0) {
      throw new ConflictException(
        'Esta categoria possui lançamentos vinculados e não pode ser excluída. Desative-a em vez disso.',
      );
    }

    return this.prisma.financialCategory.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
