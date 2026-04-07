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
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Subjects (Disciplinas)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova disciplina vinculada a um curso' })
  create(@Body() createSubjectDto: CreateSubjectDto, @CurrentUser() user: any) {
    createSubjectDto.institutionId = user.institutionId;
    return this.subjectsService.create(createSubjectDto, user);
  }

  @Get()
  @ApiOperation({
    summary: 'Listar disciplinas (com filtro opcional por curso)',
  })
  @ApiQuery({
    name: 'courseId',
    required: false,
    description: 'Filtrar disciplinas por um Curso específico',
  })
  findAll(@CurrentUser() user: any, @Query('courseId') courseId?: string) {
    return this.subjectsService.findAll(user, courseId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Procurar uma disciplina específica' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.subjectsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados de uma disciplina' })
  update(
    @Param('id') id: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
    @CurrentUser() user: any,
  ) {
    delete updateSubjectDto.institutionId;
    return this.subjectsService.update(id, updateSubjectDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma disciplina' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.subjectsService.remove(id, user);
  }
}
