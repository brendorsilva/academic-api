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
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Courses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo curso' })
  @Roles(Role.ADMIN, Role.COORDINATOR)
  create(@Body() createCourseDto: CreateCourseDto, @CurrentUser() user: any) {
    return this.coursesService.create(createCourseDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os cursos da instituição' })
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TEACHER)
  findAll(@CurrentUser() user: any) {
    return this.coursesService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Procurar um curso específico pelo ID' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados de um curso' })
  update(
    @Param('id') id: string,
    @Body() updateCourseDto: UpdateCourseDto,
    @CurrentUser() user: any,
  ) {
    delete (updateCourseDto as any).institutionId;
    return this.coursesService.update(id, updateCourseDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um curso' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.coursesService.remove(id, user);
  }
}
