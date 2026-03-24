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
import { GradesService } from './grades.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { CreateGradeDto, UpdateGradeDto } from './dto/create-grades.dto';

@Controller('grades')
@UseGuards(JwtAuthGuard, RolesGuard)
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  // Apenas professores e diretores lançam notas
  @Post()
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TEACHER)
  create(@Body() createDto: CreateGradeDto, @CurrentUser() user: any) {
    return this.gradesService.create(createDto, user);
  }

  // Alteração de nota com geração de comprovante
  @Patch(':id')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TEACHER)
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateGradeDto,
    @CurrentUser() user: any,
  ) {
    return this.gradesService.update(id, updateDto, user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TEACHER)
  remove(
    @Param('id') id: string,
    @Body('reason') reason: string, // Espera receber o motivo no corpo da requisição
    @CurrentUser() user: any,
  ) {
    return this.gradesService.remove(id, reason, user);
  }

  // Rota para o boletim do aluno (Todos podem ver, mas a regra no service bloqueia alunos bisbilhoteiros)
  @Get('boletim/student/:studentId')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TEACHER, Role.STUDENT)
  getStudentBoletim(
    @Param('studentId') studentId: string,
    @CurrentUser() user: any,
  ) {
    return this.gradesService.getStudentBoletim(studentId, user);
  }
}
