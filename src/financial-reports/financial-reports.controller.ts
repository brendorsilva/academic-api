import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialReportsService } from './financial-reports.service';
import {
  ByAccountFilterDto,
  ByCategoryFilterDto,
  CashFlowFilterDto,
  DreFilterDto,
} from './dto/financial-report.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Financeiro - Relatórios')
@ApiBearerAuth()
@Controller('financial-reports')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class FinancialReportsController {
  constructor(private readonly service: FinancialReportsService) {}

  @Get('cash-flow')
  @ApiOperation({
    summary: 'Fluxo de caixa agrupado por período (DAY/WEEK/MONTH)',
    description:
      'Retorna entradas e saídas totalizadas por período. Filtra por conta, status e intervalo de datas.',
  })
  getCashFlow(
    @Query() filters: CashFlowFilterDto,
    @CurrentUser() user: any,
  ) {
    return this.service.getCashFlow(filters, user);
  }

  @Get('by-category')
  @ApiOperation({
    summary: 'Movimentação consolidada por categoria',
    description:
      'Agrupa lançamentos por categoria com total e contagem. Filtra por tipo (INCOME/EXPENSE), status e período.',
  })
  getByCategory(
    @Query() filters: ByCategoryFilterDto,
    @CurrentUser() user: any,
  ) {
    return this.service.getByCategory(filters, user);
  }

  @Get('by-account')
  @ApiOperation({
    summary: 'Extrato por conta: saldo inicial, movimentos e saldo final',
    description:
      'Calcula saldo de abertura, totaliza receitas e despesas no período e projeta saldo de fechamento por conta.',
  })
  getByAccount(
    @Query() filters: ByAccountFilterDto,
    @CurrentUser() user: any,
  ) {
    return this.service.getByAccount(filters, user);
  }

  @Get('dre')
  @ApiOperation({
    summary: 'DRE simplificado: receitas - despesas = resultado líquido',
    description:
      'Demonstrativo de resultado com receitas e despesas agrupadas por categoria e resultado líquido do período.',
  })
  getDre(
    @Query() filters: DreFilterDto,
    @CurrentUser() user: any,
  ) {
    return this.service.getDre(filters, user);
  }
}
