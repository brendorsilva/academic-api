import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFinancialAccountDto,
  UpdateFinancialAccountDto,
} from './dto/create-financial-account.dto';

@Injectable()
export class FinancialAccountsService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateFinancialAccountDto, user: any) {
    return this.prisma.financialAccount.create({
      data: {
        institutionId: user.institutionId,
        name: dto.name,
        type: dto.type,
        description: dto.description,
        isActive: dto.isActive ?? true,
        balance: dto.initialBalance ?? 0,
      },
    });
  }

  async findAll(user: any) {
    return this.prisma.financialAccount.findMany({
      where: { institutionId: user.institutionId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string, user: any) {
    const account = await this.prisma.financialAccount.findFirst({
      where: { id, institutionId: user.institutionId },
    });
    if (!account) throw new NotFoundException('Conta financeira não encontrada.');
    return account;
  }

  async update(id: string, dto: UpdateFinancialAccountDto, user: any) {
    await this.findOne(id, user);
    // balance nunca é atualizado diretamente via API
    const { ...safeData } = dto;
    return this.prisma.financialAccount.update({
      where: { id },
      data: safeData,
    });
  }

  async remove(id: string, user: any) {
    await this.findOne(id, user);

    const hasTransactions = await this.prisma.financialTransaction.count({
      where: { accountId: id },
    });
    if (hasTransactions > 0) {
      throw new ConflictException(
        'Esta conta possui lançamentos vinculados e não pode ser excluída. Desative-a em vez disso.',
      );
    }

    return this.prisma.financialAccount.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async getSummary(user: any) {
    const accounts = await this.prisma.financialAccount.findMany({
      where: { institutionId: user.institutionId, isActive: true },
      orderBy: { name: 'asc' },
    });

    const summary = await Promise.all(
      accounts.map(async (account) => {
        const [incomeAgg, expenseAgg] = await Promise.all([
          this.prisma.financialTransaction.aggregate({
            where: {
              accountId: account.id,
              type: 'INCOME',
              status: 'CONFIRMED',
            },
            _sum: { amount: true },
          }),
          this.prisma.financialTransaction.aggregate({
            where: {
              accountId: account.id,
              type: 'EXPENSE',
              status: 'CONFIRMED',
            },
            _sum: { amount: true },
          }),
        ]);

        const totalIncome = incomeAgg._sum.amount ?? 0;
        const totalExpense = expenseAgg._sum.amount ?? 0;

        return {
          accountId: account.id,
          accountName: account.name,
          accountType: account.type,
          totalIncome,
          totalExpense,
          netBalance: totalIncome - totalExpense,
          storedBalance: account.balance,
        };
      }),
    );

    return summary;
  }
}
