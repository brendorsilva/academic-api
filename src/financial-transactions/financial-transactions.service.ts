import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateFinancialTransactionDto,
  UpdateFinancialTransactionDto,
  FilterFinancialTransactionDto,
} from './dto/financial-transaction.dto';

@Injectable()
export class FinancialTransactionsService {
  constructor(private prisma: PrismaService) {}

  // ─── Criar lançamento ─────────────────────────────────────────────────────
  async create(dto: CreateFinancialTransactionDto, user: any) {
    return this.prisma.$transaction(async (tx) => {
      // Valida categoria e conta da instituição
      const [category, account] = await Promise.all([
        tx.financialCategory.findFirst({
          where: { id: dto.categoryId, institutionId: user.institutionId },
        }),
        tx.financialAccount.findFirst({
          where: { id: dto.accountId, institutionId: user.institutionId },
        }),
      ]);
      if (!category) throw new NotFoundException('Categoria não encontrada.');
      if (!account) throw new NotFoundException('Conta não encontrada.');

      const status = dto.status ?? 'PENDING';

      const transaction = await tx.financialTransaction.create({
        data: {
          institutionId: user.institutionId,
          description: dto.description,
          amount: dto.amount,
          type: dto.type,
          status,
          dueDate: new Date(dto.dueDate),
          paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,
          reference: dto.reference,
          notes: dto.notes,
          categoryId: dto.categoryId,
          accountId: dto.accountId,
        },
        include: { category: true, account: true },
      });

      // Atualiza saldo se já criado como CONFIRMED
      if (status === 'CONFIRMED') {
        await this.applyBalanceDelta(tx, account.id, dto.type, dto.amount, 'apply');
      }

      return transaction;
    });
  }

  // ─── Listar lançamentos com filtros ───────────────────────────────────────
  async findAll(filters: FilterFinancialTransactionDto, user: any) {
    const where: any = { institutionId: user.institutionId };

    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.categoryId) where.categoryId = filters.categoryId;
    if (filters.accountId) where.accountId = filters.accountId;
    if (filters.startDate || filters.endDate) {
      where.dueDate = {};
      if (filters.startDate) where.dueDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.dueDate.lte = new Date(filters.endDate);
    }

    return this.prisma.financialTransaction.findMany({
      where,
      include: { category: true, account: true },
      orderBy: { dueDate: 'desc' },
    });
  }

  // ─── Buscar por ID ────────────────────────────────────────────────────────
  async findOne(id: string, user: any) {
    const transaction = await this.prisma.financialTransaction.findFirst({
      where: { id, institutionId: user.institutionId },
      include: { category: true, account: true },
    });
    if (!transaction) throw new NotFoundException('Lançamento não encontrado.');
    return transaction;
  }

  // ─── Atualizar lançamento (reconciliação atômica de saldo) ────────────────
  async update(id: string, dto: UpdateFinancialTransactionDto, user: any) {
    const existing = await this.findOne(id, user);

    if (existing.status === 'CANCELLED') {
      throw new BadRequestException('Lançamentos cancelados não podem ser editados.');
    }

    return this.prisma.$transaction(async (tx) => {
      const wasConfirmed = existing.status === 'CONFIRMED';
      const newStatus = dto.status ?? existing.status;
      const willBeConfirmed = newStatus === 'CONFIRMED';

      const newAmount = dto.amount ?? existing.amount;
      const newType = dto.type ?? existing.type;
      const newAccountId = dto.accountId ?? existing.accountId;

      // Passo 1: reverter impacto anterior se era CONFIRMED
      if (wasConfirmed) {
        await this.applyBalanceDelta(tx, existing.accountId, existing.type, existing.amount, 'reverse');
      }

      // Passo 2: aplicar novo impacto se vai ser CONFIRMED
      if (willBeConfirmed) {
        await this.applyBalanceDelta(tx, newAccountId, newType, newAmount, 'apply');
      }

      // Passo 3: atualizar o lançamento
      return tx.financialTransaction.update({
        where: { id },
        data: {
          ...(dto.description && { description: dto.description }),
          ...(dto.amount !== undefined && { amount: dto.amount }),
          ...(dto.type && { type: dto.type }),
          ...(dto.status && { status: dto.status }),
          ...(dto.dueDate && { dueDate: new Date(dto.dueDate) }),
          ...(dto.paymentDate !== undefined && {
            paymentDate: dto.paymentDate ? new Date(dto.paymentDate) : null,
          }),
          ...(dto.reference !== undefined && { reference: dto.reference }),
          ...(dto.notes !== undefined && { notes: dto.notes }),
          ...(dto.categoryId && { categoryId: dto.categoryId }),
          ...(dto.accountId && { accountId: dto.accountId }),
        },
        include: { category: true, account: true },
      });
    });
  }

  // ─── Excluir lançamento ───────────────────────────────────────────────────
  async remove(id: string, user: any) {
    const existing = await this.findOne(id, user);

    return this.prisma.$transaction(async (tx) => {
      // Se era CONFIRMED, reverter saldo antes de cancelar
      if (existing.status === 'CONFIRMED') {
        await this.applyBalanceDelta(tx, existing.accountId, existing.type, existing.amount, 'reverse');
        return tx.financialTransaction.update({
          where: { id },
          data: { status: 'CANCELLED' },
        });
      }

      // PENDING ou CANCELLED → hard delete seguro
      await tx.financialTransaction.delete({ where: { id } });
      return { message: 'Lançamento excluído com sucesso.' };
    });
  }

  // ─── Resumo financeiro geral ──────────────────────────────────────────────
  async getSummary(filters: FilterFinancialTransactionDto, user: any) {
    const baseWhere: any = { institutionId: user.institutionId };

    if (filters.categoryId) baseWhere.categoryId = filters.categoryId;
    if (filters.accountId) baseWhere.accountId = filters.accountId;
    if (filters.startDate || filters.endDate) {
      baseWhere.dueDate = {};
      if (filters.startDate) baseWhere.dueDate.gte = new Date(filters.startDate);
      if (filters.endDate) baseWhere.dueDate.lte = new Date(filters.endDate);
    }

    const [incomeAgg, expenseAgg, pendingIncomeAgg, pendingExpenseAgg] =
      await Promise.all([
        this.prisma.financialTransaction.aggregate({
          where: { ...baseWhere, type: 'INCOME', status: 'CONFIRMED' },
          _sum: { amount: true },
        }),
        this.prisma.financialTransaction.aggregate({
          where: { ...baseWhere, type: 'EXPENSE', status: 'CONFIRMED' },
          _sum: { amount: true },
        }),
        this.prisma.financialTransaction.aggregate({
          where: { ...baseWhere, type: 'INCOME', status: 'PENDING' },
          _sum: { amount: true },
        }),
        this.prisma.financialTransaction.aggregate({
          where: { ...baseWhere, type: 'EXPENSE', status: 'PENDING' },
          _sum: { amount: true },
        }),
      ]);

    const totalIncome = incomeAgg._sum.amount ?? 0;
    const totalExpense = expenseAgg._sum.amount ?? 0;
    const pendingIncome = pendingIncomeAgg._sum.amount ?? 0;
    const pendingExpense = pendingExpenseAgg._sum.amount ?? 0;

    return {
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      pendingIncome,
      pendingExpense,
    };
  }

  // ─── Helper: aplicar ou reverter delta no saldo da conta ─────────────────
  private async applyBalanceDelta(
    tx: any,
    accountId: string,
    type: string,
    amount: number,
    operation: 'apply' | 'reverse',
  ) {
    const isIncome = type === 'INCOME';
    const shouldIncrement =
      (isIncome && operation === 'apply') ||
      (!isIncome && operation === 'reverse');

    await tx.financialAccount.update({
      where: { id: accountId },
      data: shouldIncrement
        ? { balance: { increment: amount } }
        : { balance: { decrement: amount } },
    });
  }
}
