// src/users/users.controller.ts
import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Delete,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { CreateUserAccessDto } from './dto/create-user-access.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';
import { CreateCoordinatorDto } from './dto/create-coordinator.dto';

@ApiTags('Users (Signup)')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // Esta rota é pública para permitir o primeiro cadastro
  @Post()
  @ApiOperation({ summary: 'Cria um novo usuário administrativo' })
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Post('generate-access')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  generateAccess(@Body() dto: CreateUserAccessDto, @CurrentUser() user: any) {
    return this.usersService.generateAccess(dto, user);
  }

  @Get()
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({
    summary: 'Lista todos os utilizadores da instituição com suas roles',
  })
  findAll(@CurrentUser() adminUser: any) {
    return this.usersService.findAll(adminUser);
  }

  @Get('coordinators')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  listCoordinators(@CurrentUser() adminUser: any) {
    return this.usersService.listCoordinators(adminUser);
  }

  @Delete('coordinator/:id')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remove um usuário com perfil de Coordenador' })
  removeCoordinator(@Param('id') id: string, @CurrentUser() adminUser: any) {
    return this.usersService.removeCoordinator(id, adminUser);
  }

  @Post('coordinator')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Cria um novo usuário com perfil de Coordenador' })
  createCoordinator(
    @Body() dto: CreateCoordinatorDto,
    @CurrentUser() adminUser: any,
  ) {
    return this.usersService.createCoordinator(dto, adminUser);
  }

  @Post(':id/teacher/:teacherId')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN, Role.COORDINATOR)
  @ApiOperation({
    summary:
      'Vincula um perfil de professor a um utilizador existente e adiciona a role TEACHER',
  })
  linkTeacher(
    @Param('id') id: string,
    @Param('teacherId') teacherId: string,
    @CurrentUser() adminUser: any,
  ) {
    return this.usersService.linkTeacher(id, teacherId, adminUser);
  }

  @Post(':id/roles')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Adiciona uma role a um utilizador' })
  addRole(
    @Param('id') id: string,
    @Body('role') role: Role,
    @CurrentUser() adminUser: any,
  ) {
    return this.usersService.addRole(id, role, adminUser);
  }

  @Delete(':id/roles/:role')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove uma role de um utilizador' })
  removeRole(
    @Param('id') id: string,
    @Param('role') role: Role,
    @CurrentUser() adminUser: any,
  ) {
    return this.usersService.removeRole(id, role, adminUser);
  }

  @Post('update-password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Body('password') newPassword: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.updatePassword(user.userId, newPassword);
  }
}
