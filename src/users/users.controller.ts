// src/users/users.controller.ts
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';
import { CreateUserAccessDto } from './dto/create-user-access.dto';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { RolesGuard } from 'src/auth/roles.guard';

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

  @Post('update-password')
  @UseGuards(JwtAuthGuard)
  async updatePassword(
    @Body('password') newPassword: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.updatePassword(user.userId, newPassword);
  }
}
