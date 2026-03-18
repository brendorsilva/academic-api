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
import { ClassGroupsService } from './class-groups.service';
import { CreateClassGroupDto } from './dto/create-class-group.dto';
import { UpdateClassGroupDto } from './dto/update-class-group.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Class Groups (Turmas)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('class-groups')
export class ClassGroupsController {
  constructor(private readonly classGroupsService: ClassGroupsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar uma nova turma' })
  create(
    @Body() createClassGroupDto: CreateClassGroupDto,
    @CurrentUser() user: any,
  ) {
    createClassGroupDto.institutionId = user.institutionId;
    return this.classGroupsService.create(createClassGroupDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar turmas (com filtros opcionais)' })
  @ApiQuery({ name: 'courseId', required: false })
  @ApiQuery({ name: 'periodId', required: false })
  findAll(
    @CurrentUser() user: any,
    @Query('courseId') courseId?: string,
    @Query('periodId') periodId?: string,
  ) {
    return this.classGroupsService.findAll(
      user.institutionId,
      courseId,
      periodId,
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Procurar uma turma específica' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.classGroupsService.findOne(id, user.institutionId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados de uma turma' })
  update(
    @Param('id') id: string,
    @Body() updateClassGroupDto: UpdateClassGroupDto,
    @CurrentUser() user: any,
  ) {
    delete updateClassGroupDto.institutionId;
    return this.classGroupsService.update(
      id,
      updateClassGroupDto,
      user.institutionId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir uma turma' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.classGroupsService.remove(id, user.institutionId);
  }
}
