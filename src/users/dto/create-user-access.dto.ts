// src/users/dto/create-user-access.dto.ts
import {
  IsString,
  IsNotEmpty,
  IsEnum,
  IsEmail,
  MinLength,
} from 'class-validator';
import { Role } from '@prisma/client';

export class CreateUserAccessDto {
  @IsString()
  @IsNotEmpty()
  profileId: string; // ID do Aluno ou ID do Professor

  @IsEnum(Role)
  @IsNotEmpty()
  role: Role; // 'STUDENT' ou 'TEACHER'

  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;
}
