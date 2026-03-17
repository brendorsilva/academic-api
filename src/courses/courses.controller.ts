import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo curso' })
  create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: any) {
    createCourseDto.institutionId = user.institutionId;
    return this.coursesService.create(createCourseDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os cursos da instituição' })
  findAll(@CurrentUser() user: any) {
    return this.coursesService.findAll(user.institutionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Procurar um curso específico pelo ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.findOne(id, user.institutionId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados de um curso' })
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: any,
  ) {
    delete updateCourseDto.institutionId;
    return this.coursesService.update(id, updateCourseDto, user.institutionId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um curso' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.remove(id, user.institutionId);
  }
}
