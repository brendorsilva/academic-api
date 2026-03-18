import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Enrollments (Matrículas)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Realizar matrícula de um Aluno numa Turma' })
  create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @CurrentUser() user: any,
  ) {
    createEnrollmentDto.institutionId = user.institutionId;
    return this.enrollmentsService.create(createEnrollmentDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar matrículas (Filtros opcionais por Turma ou Aluno)',
  })
  @ApiQuery({ name: 'classGroupId', required: false })
  @ApiQuery({ name: 'studentId', required: false })
  findAll(
    @CurrentUser() user: any,
    @Query('classGroupId') classGroupId?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.enrollmentsService.findAll(
      user.institutionId,
      classGroupId,
      studentId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes completos de uma Matrícula' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.enrollmentsService.findOne(id, user.institutionId);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancelar/Excluir Matrícula (Apenas para correção de erros)',
  })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.enrollmentsService.remove(id, user.institutionId);
  }
}
