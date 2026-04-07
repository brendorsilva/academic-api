import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Headers,
  UnauthorizedException,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { StudentsService } from './students.service';
import { CreateStudentDto } from './dto/create-student.dto';
import { UpdateStudentDto } from './dto/update-student.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { CurrentUser } from 'src/auth/current-user.decorator';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import type { FastifyRequest } from 'fastify';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Students')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('students')
export class StudentsController {
  constructor(
    private readonly studentsService: StudentsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Regista um novo aluno' })
  @Roles(Role.ADMIN, Role.COORDINATOR)
  create(@Body() createStudentDto: CreateStudentDto, @CurrentUser() user: any) {
    return this.studentsService.create(createStudentDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os alunos da instituição' })
  findAll(@CurrentUser() user: any) {
    return this.studentsService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém os detalhes de um aluno específico' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.studentsService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um aluno' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(id, updateStudentDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove o registo de um aluno' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.studentsService.remove(id, user);
  }

  @Post(':id/photo')
  @ApiOperation({ summary: 'Faz o upload da foto do aluno' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
        },
      },
    },
  })
  async uploadPhoto(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: FastifyRequest,
  ) {
    if (!req.isMultipart()) {
      throw new BadRequestException(
        'A requisição deve ser multipart/form-data',
      );
    }

    const data = await req.file();
    if (!data) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    const buffer = await data.toBuffer();

    try {
      const result = await this.cloudinaryService.uploadImage(
        buffer,
        id,
        'students',
      );

      return this.studentsService.updatePhotoUrl(id, result.secure_url, user);
    } catch (error) {
      throw new BadRequestException('Falha ao processar o upload da imagem');
    }
  }
}
