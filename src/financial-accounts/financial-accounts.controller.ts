import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { FinancialAccountsService } from './financial-accounts.service';
import {
  CreateFinancialAccountDto,
  UpdateFinancialAccountDto,
} from './dto/create-financial-account.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Financeiro - Contas')
@ApiBearerAuth()
@Controller('financial-accounts')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class FinancialAccountsController {
  constructor(private readonly service: FinancialAccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar conta financeira' })
  create(@Body() dto: CreateFinancialAccountDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar contas financeiras' })
  findAll(@CurrentUser() user: any) {
    return this.service.findAll(user);
  }

  // summary DEVE vir antes de :id para não ser capturado como ID
  @Get('summary')
  @ApiOperation({ summary: 'Resumo financeiro por conta (totais de receita/despesa/saldo)' })
  getSummary(@CurrentUser() user: any) {
    return this.service.getSummary(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar conta por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar conta (saldo não é editável via API)' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFinancialAccountDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar conta (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}
