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
import { TransactionType } from '@prisma/client';
import { FinancialCategoriesService } from './financial-categories.service';
import {
  CreateFinancialCategoryDto,
  UpdateFinancialCategoryDto,
} from './dto/create-financial-category.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Financeiro - Categorias')
@ApiBearerAuth()
@Controller('financial-categories')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class FinancialCategoriesController {
  constructor(private readonly service: FinancialCategoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar categoria financeira' })
  create(@Body() dto: CreateFinancialCategoryDto, @CurrentUser() user: any) {
    return this.service.create(dto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar categorias (filtro opcional: ?type=INCOME|EXPENSE)' })
  findAll(
    @CurrentUser() user: any,
    @Query('type') type?: TransactionType,
  ) {
    return this.service.findAll(user, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar categoria por ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFinancialCategoryDto,
    @CurrentUser() user: any,
  ) {
    return this.service.update(id, dto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Desativar categoria (soft delete)' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.service.remove(id, user);
  }
}
