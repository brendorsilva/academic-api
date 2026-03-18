import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
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
import { ClassSubjectsService } from './class-subjects.service';
import { CreateClassSubjectDto } from './dto/create-class-subject.dto';
import { UpdateClassSubjectDto } from './dto/update-class-subject.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Class Subjects (Ofertas de Disciplinas)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('class-subjects')
export class ClassSubjectsController {
  constructor(private readonly classSubjectsService: ClassSubjectsService) {}

  @Post()
  @ApiOperation({
    summary: 'Vincular uma disciplina a uma turma (Criar Oferta)',
  })
  create(
    @Body() createClassSubjectDto: CreateClassSubjectDto,
    @CurrentUser() user: any,
  ) {
    createClassSubjectDto.institutionId = user.institutionId;
    return this.classSubjectsService.create(createClassSubjectDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar ofertas de disciplinas (com filtro opcional por Turma)',
  })
  @ApiQuery({ name: 'classGroupId', required: false })
  findAll(
    @CurrentUser() user: any,
    @Query('classGroupId') classGroupId?: string,
  ) {
    return this.classSubjectsService.findAll(user.institutionId, classGroupId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Procurar uma oferta específica' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.classSubjectsService.findOne(id, user.institutionId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Atualizar dados da oferta (ex: mudar o professor ou sala)',
  })
  update(
    @Param('id') id: string,
    @Body() updateClassSubjectDto: UpdateClassSubjectDto,
    @CurrentUser() user: any,
  ) {
    delete updateClassSubjectDto.institutionId;
    return this.classSubjectsService.update(
      id,
      updateClassSubjectDto,
      user.institutionId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma oferta de disciplina' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.classSubjectsService.remove(id, user.institutionId);
  }
}
