// src/users/users.controller.ts
import { Controller, Post, Body, UseGuards, Get, Delete } from '@nestjs/common';
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

  @Get('coordinators')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  listCoordinators(@CurrentUser() adminUser: any) {
    return this.usersService.listCoordinators(adminUser);
  }

  @Delete('coordinator')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(Role.ADMIN)
  @ApiOperation({ summary: 'Remove um usuário com perfil de Coordenador' })
  removeCoordinator(
    @Body('email') email: string,
    @CurrentUser() adminUser: any,
  ) {
    return this.usersService.removeCoordinator(email, adminUser);
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

  @Post('update-password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Body('password') newPassword: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.updatePassword(user.userId, newPassword);
  }
}
