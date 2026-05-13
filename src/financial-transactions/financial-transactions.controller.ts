import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialTransactionsService } from './financial-transactions.service';
import {
  CreateFinancialTransactionDto,
  UpdateFinancialTransactionDto,
  FilterFinancialTransactionDto,
} from './dto/financial-transaction.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Financeiro - Lançamentos')
@ApiBearerAuth()
@Controller('financial-transactions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class FinancialTransactionsController {
  constructor(private readonly service: FinancialTransactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar lançamento financeiro' })
  create(
    @Body() dto: CreateFinancialTransactionDto,
    @CurrentUser() user: any,
  ) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar lançamentos (filtros: type, status, categoryId, accountId, startDate, endDate)',
  })
  findAll(
    @Query() filters: FilterFinancialTransactionDto,
    @CurrentUser() user: any,
  ) {
    return this.service.findAll(filters, user);
  }

  // summary DEVE vir antes de :id
  @Get('summary')
  @ApiOperation({
    summary: 'Totais de receitas, despesas e saldo líquido (filtros: categoryId, accountId, startDate, endDate)',
  })
  getSummary(
    @Query() filters: FilterFinancialTransactionDto,
    @CurrentUser() user: any,
  ) {
    return this.service.getSummary(filters, user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar lançamento por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar lançamento (reconcilia saldo automaticamente)',
  })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFinancialTransactionDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({
    summary:
      'Excluir lançamento (CONFIRMED → cancela+reverte saldo; PENDING → exclui)',
  })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}
