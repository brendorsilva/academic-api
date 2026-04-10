import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Get,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import {
  CreateGradeDto,
  UpdateGradeDto,
  BatchGradeDto,
} from './dto/create-grades.dto';

@ApiTags('Notas')
@ApiBearerAuth()
@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Post()
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TEACHER)
  @ApiOperation({ summary: 'Lançar uma nota individual' })
  create(@Body() createDto: CreateGradeDto, @CurrentUser() user: any) {
    return this.gradesService.create(createDto, user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TEACHER)
  @ApiOperation({ summary: 'Alterar nota com geração de comprovante' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateGradeDto,
    @CurrentUser() user: any,
  ) {
    return this.gradesService.update(id, updateDto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TEACHER)
  @ApiOperation({ summary: 'Excluir nota com auditoria' })
  remove(
    @Param('id') id: string,
    @Body('reason') reason: string,
    @CurrentUser() user: any,
  ) {
    return this.gradesService.remove(id, reason, user);
  }

  @Get('boletim/student/:studentId')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TEACHER, Role.STUDENT)
  @ApiOperation({ summary: 'Boletim completo do aluno' })
  getStudentBoletim(
    @Param('studentId') studentId: string,
    @CurrentUser() user: any,
  ) {
    return this.gradesService.getStudentBoletim(studentId, user);
  }

  @Get('grade-book/:classSubjectId')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TEACHER)
  @ApiOperation({
    summary: 'Caderno de notas — visão em grade por período avaliativo',
    description:
      'Retorna todos os alunos da disciplina com suas notas organizadas por período (bimestre/trimestre/semestre). Professores só acessam disciplinas que lecionam.',
  })
  getGradeBook(
    @Param('classSubjectId') classSubjectId: string,
    @CurrentUser() user: any,
  ) {
    return this.gradesService.getGradeBook(classSubjectId, user);
  }

  @Post('batch')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TEACHER)
  @ApiOperation({
    summary: 'Lançamento em lote — salva notas de uma avaliação para a turma',
    description:
      'Cria ou atualiza notas de múltiplos alunos de uma vez. Ideal para preencher o caderno de notas. Se a nota já existir (mesmo nome + período + aluno), ela é atualizada com auditoria.',
  })
  batchUpsert(@Body() dto: BatchGradeDto, @CurrentUser() user: any) {
    return this.gradesService.batchUpsert(dto, user);
  }
}
