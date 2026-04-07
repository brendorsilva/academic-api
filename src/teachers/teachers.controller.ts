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
  @Roles(Role.ADMIN)
  create(@Body() createTeacherDto: CreateTeacherDto, @CurrentUser() user: any) {
    return this.teachersService.create(createTeacherDto, user);
  }

  @Get()
  @ApiOperation({ summary: 'Lista todos os professores da instituição' })
  @Roles(Role.ADMIN, Role.COORDINATOR)
  findAll(@CurrentUser() user: any) {
    return this.teachersService.findAll(user);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtém os detalhes de um professor específico' })
  @Roles(Role.ADMIN, Role.COORDINATOR)
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teachersService.findOne(id, user);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza os dados de um professor' })
  @Roles(Role.ADMIN)
  update(
    @Param('id') id: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
    @CurrentUser() user: any,
  ) {
    return this.teachersService.update(id, updateTeacherDto, user);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Inativa um professor (Soft Delete)' })
  @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.teachersService.remove(id, user);
  }

  @Post(':id/photo')
  @ApiOperation({ summary: 'Faz o upload da foto do professor' })
  @Roles(Role.ADMIN)
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
      const result = await this.cloudinaryService.uploadImage(
        buffer,
        id,
        'teachers',
      );
      return this.teachersService.updatePhotoUrl(id, result.secure_url, user);
    } catch (error) {
      throw new BadRequestException('Falha ao processar o upload da imagem');
    }
  }
}
