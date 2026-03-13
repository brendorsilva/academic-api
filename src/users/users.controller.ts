// src/users/users.controller.ts
import { Controller, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';

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
}
