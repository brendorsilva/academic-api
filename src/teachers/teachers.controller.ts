import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import type { FastifyRequest } from 'fastify';
import { RolesGuard } from 'src/auth/roles.guard';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Teachers')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('teachers')
export class TeachersController {
  constructor(
    private readonly teachersService: TeachersService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Cadastra um novo professor' })
  @Roles(Role.ADMIN, Role.COORDINATOR)
  create(@Body() createTeacherDto: CreateTeacherDto, @CurrentUser() user: any) {
    createTeacherDto.institutionId = user.institutionId;
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os professores da instituição' })
  findAll(@CurrentUser() user: any) {
    return this.teachersService.findAll(user.institutionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém os detalhes de um professor específico' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teachersService.findOne(id, user.institutionId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um professor' })
  update(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @CurrentUser() user: any,
  ) {
    return this.teachersService.update(
      id,
      user.institutionId,
      updateTeacherDto,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Inativa um professor (Soft Delete)' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teachersService.remove(id, user.institutionId);
  }

  @Post(':id/photo')
  @ApiOperation({ summary: 'Faz o upload da foto do professor' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { file: { type: 'string', format: 'binary' } },
    },
  })
  async uploadPhoto(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Req() req: FastifyRequest,
  ) {
    if (!req.isMultipart())
      throw new BadRequestException(
        'A requisição deve ser multipart/form-data',
      );

    const data = await req.file();
    if (!data) throw new BadRequestException('Nenhum arquivo enviado');

    const buffer = await data.toBuffer();

    try {
      // Aqui usamos a genialidade da nossa refatoração: mudamos apenas a string para 'teachers'
      const result = await this.cloudinaryService.uploadImage(
        buffer,
        id,
        'teachers',
      );
      return this.teachersService.updatePhotoUrl(
        id,
        user.institutionId,
        result.secure_url,
      );
    } catch (error) {
      throw new BadRequestException('Falha ao processar o upload da imagem');
    }
  }
}
