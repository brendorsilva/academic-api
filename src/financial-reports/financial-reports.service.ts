import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  ByAccountFilterDto,
  ByCategoryFilterDto,
  CashFlowFilterDto,
  DreFilterDto,
  ReportGroupBy,
} from './dto/financial-report.dto';

@Injectable()
export class FinancialReportsService {
  constructor(private prisma: PrismaService) {}

  // ─── Fluxo de Caixa ──────────────────────────────────────────────────────
  async getCashFlow(filters: CashFlowFilterDto, user: any) {
    const where: any = {
      institutionId: user.institutionId,
      status: filters.status ?? 'CONFIRMED',
    };

    if (filters.accountId) where.accountId = filters.accountId;

    where.dueDate = {
      gte: new Date(filters.startDate),
      lte: new Date(filters.endDate),
    };

    const transactions = await this.prisma.financialTransaction.findMany({
      where,
      include: { category: true, account: true },
      orderBy: { dueDate: 'asc' },
    });

    const groupBy = filters.groupBy ?? ReportGroupBy.MONTH;
    const grouped: Record<string, {
      period: string;
      totalIncome: number;
      totalExpense: number;
      netBalance: number;
      transactions: any[];
    }> = {};

    for (const tx of transactions) {
      const key = this.getPeriodKey(tx.dueDate, groupBy);
      if (!grouped[key]) {
        grouped[key] = { period: key, totalIncome: 0, totalExpense: 0, netBalance: 0, transactions: [] };
      }
      if (tx.type === 'INCOME') {
        grouped[key].totalIncome += tx.amount;
      } else {
        grouped[key].totalExpense += tx.amount;
      }
      grouped[key].netBalance = grouped[key].totalIncome - grouped[key].totalExpense;
      grouped[key].transactions.push(tx);
    }

    const periods = Object.values(grouped).sort((a, b) => a.period.localeCompare(b.period));

    const totalIncome = periods.reduce((sum, p) => sum + p.totalIncome, 0);
    const totalExpense = periods.reduce((sum, p) => sum + p.totalExpense, 0);

    return {
      groupBy,
      startDate: filters.startDate,
      endDate: filters.endDate,
      totalIncome,
      totalExpense,
      netBalance: totalIncome - totalExpense,
      periods,
    };
  }

  // ─── Movimentação por Categoria ───────────────────────────────────────────
  async getByCategory(filters: ByCategoryFilterDto, user: any) {
    const where: any = {
      institutionId: user.institutionId,
      status: filters.status ?? 'CONFIRMED',
    };

    if (filters.type) where.type = filters.type;
    if (filters.startDate || filters.endDate) {
      where.dueDate = {};
      if (filters.startDate) where.dueDate.gte = new Date(filters.startDate);
      if (filters.endDate) where.dueDate.lte = new Date(filters.endDate);
    }

    const transactions = await this.prisma.financialTransaction.findMany({
      where,
      include: { category: true, account: true },
      orderBy: { dueDate: 'desc' },
    });

    const grouped: Record<string, {
      category: any;
      totalAmount: number;
      transactionCount: number;
      transactions: any[];
    }> = {};

    for (const tx of transactions) {
      const catId = tx.categoryId;
      if (!grouped[catId]) {
        grouped[catId] = { category: tx.category, totalAmount: 0, transactionCount: 0, transactions: [] };
      }
      grouped[catId].totalAmount += tx.amount;
      grouped[catId].transactionCount++;
      grouped[catId].transactions.push(tx);
    }

    const categories = Object.values(grouped).sort((a, b) => b.totalAmount - a.totalAmount);

    const totalAmount = categories.reduce((sum, c) => sum + c.totalAmount, 0);

    return {
      startDate: filters.startDate,
      endDate: filters.endDate,
      type: filters.type,
      totalAmount,
      categories,
    };
  }

  // ─── Extrato por Conta ────────────────────────────────────────────────────
  async getByAccount(filters: ByAccountFilterDto, user: any) {
    const accountWhere: any = { institutionId: user.institutionId };
    if (filters.accountId) accountWhere.id = filters.accountId;

    const accounts = await this.prisma.financialAccount.findMany({
      where: accountWhere,
      orderBy: { name: 'asc' },
    });

    const results = await Promise.all(
      accounts.map(async (account) => {
        // Saldo de abertura = saldo atual - impacto de todas as transações CONFIRMED a partir de startDate
        const fromStartWhere: any = {
          accountId: account.id,
          institutionId: user.institutionId,
          status: 'CONFIRMED',
        };
        if (filters.startDate) {
          fromStartWhere.dueDate = { gte: new Date(filters.startDate) };
        }

        const [incomeFromStart, expenseFromStart] = await Promise.all([
          this.prisma.financialTransaction.aggregate({
            where: { ...fromStartWhere, type: 'INCOME' },
            _sum: { amount: true },
          }),
          this.prisma.financialTransaction.aggregate({
            where: { ...fromStartWhere, type: 'EXPENSE' },
            _sum: { amount: true },
          }),
        ]);

        const openingBalance =
          account.balance -
          (incomeFromStart._sum.amount ?? 0) +
          (expenseFromStart._sum.amount ?? 0);

        // Transações no período
        const txWhere: any = {
          accountId: account.id,
          institutionId: user.institutionId,
        };
        if (filters.startDate || filters.endDate) {
          txWhere.dueDate = {};
          if (filters.startDate) txWhere.dueDate.gte = new Date(filters.startDate);
          if (filters.endDate) txWhere.dueDate.lte = new Date(filters.endDate);
        }

        const transactions = await this.prisma.financialTransaction.findMany({
          where: txWhere,
          include: { category: true },
          orderBy: { dueDate: 'asc' },
        });

        const confirmedIncome = transactions
          .filter((t) => t.type === 'INCOME' && t.status === 'CONFIRMED')
          .reduce((sum, t) => sum + t.amount, 0);

        const confirmedExpense = transactions
          .filter((t) => t.type === 'EXPENSE' && t.status === 'CONFIRMED')
          .reduce((sum, t) => sum + t.amount, 0);

        return {
          account,
          openingBalance,
          totalIncome: confirmedIncome,
          totalExpense: confirmedExpense,
          closingBalance: openingBalance + confirmedIncome - confirmedExpense,
          transactions,
        };
      }),
    );

    return {
      startDate: filters.startDate,
      endDate: filters.endDate,
      accounts: results,
    };
  }

  // ─── DRE Simplificado ─────────────────────────────────────────────────────
  async getDre(filters: DreFilterDto, user: any) {
    const where: any = {
      institutionId: user.institutionId,
      status: 'CONFIRMED',
      dueDate: {
        gte: new Date(filters.startDate),
        lte: new Date(filters.endDate),
      },
    };

    const transactions = await this.prisma.financialTransaction.findMany({
      where,
      include: { category: true },
      orderBy: { dueDate: 'asc' },
    });

    const revenues: Record<string, { category: any; amount: number; count: number }> = {};
    const expenses: Record<string, { category: any; amount: number; count: number }> = {};
    let totalRevenue = 0;
    let totalExpense = 0;

    for (const tx of transactions) {
      const catId = tx.categoryId;
      if (tx.type === 'INCOME') {
        if (!revenues[catId]) revenues[catId] = { category: tx.category, amount: 0, count: 0 };
        revenues[catId].amount += tx.amount;
        revenues[catId].count++;
        totalRevenue += tx.amount;
      } else {
        if (!expenses[catId]) expenses[catId] = { category: tx.category, amount: 0, count: 0 };
        expenses[catId].amount += tx.amount;
        expenses[catId].count++;
        totalExpense += tx.amount;
      }
    }

    return {
      period: { startDate: filters.startDate, endDate: filters.endDate },
      revenues: Object.values(revenues).sort((a, b) => b.amount - a.amount),
      expenses: Object.values(expenses).sort((a, b) => b.amount - a.amount),
      totalRevenue,
      totalExpense,
      netResult: totalRevenue - totalExpense,
    };
  }

  // ─── Helpers ──────────────────────────────────────────────────────────────
  private getPeriodKey(date: Date, groupBy: ReportGroupBy): string {
    const d = new Date(date);
    if (groupBy === ReportGroupBy.DAY) {
      return d.toISOString().split('T')[0];
    }
    if (groupBy === ReportGroupBy.WEEK) {
      const year = d.getUTCFullYear();
      const week = this.getIsoWeekNumber(d);
      return `${year}-W${String(week).padStart(2, '0')}`;
    }
    return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
  }

  private getIsoWeekNumber(date: Date): number {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayOfWeek = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayOfWeek);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }
}
