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
    createStudentDto.institutionId = user.institutionId;
    return this.studentsService.create(createStudentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os alunos da instituição' })
  findAll(@CurrentUser() user: any) {
    return this.studentsService.findAll(user.institutionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém os detalhes de um aluno específico' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.studentsService.findOne(id, user.institutionId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um aluno' })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.studentsService.update(
      id,
      user.institutionId,
      updateStudentDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Remove o registo de um aluno' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.studentsService.remove(id, user.institutionId);
  }

  @Post(':id/photo')
  @ApiOperation({ summary: 'Faz o upload da foto do aluno' })
  // Decorators para o Swagger entender que é um upload de arquivo
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
    // 1. Verifica se a requisição é multipart
    if (!req.isMultipart()) {
      throw new BadRequestException(
        'A requisição deve ser multipart/form-data',
      );
    }

    // 2. Extrai o arquivo da requisição do Fastify
    const data = await req.file();
    if (!data) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    // 3. Converte para Buffer
    const buffer = await data.toBuffer();

    try {
      const result = await this.cloudinaryService.uploadImage(
        buffer,
        id,
        'students',
      );

      return this.studentsService.updatePhotoUrl(
        id,
        user.institutionId,
        result.secure_url,
      );
    } catch (error) {
      throw new BadRequestException('Falha ao processar o upload da imagem');
    }
  }
}
