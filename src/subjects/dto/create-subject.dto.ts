import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SubType } from '@prisma/client';

export class CreateSubjectDto {
  @ApiPropertyOptional({ description: 'Injetado automaticamente pelo token' })
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @ApiProperty({ description: 'ID do Curso ao qual esta disciplina pertence' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: 'Nome da disciplina', example: 'Cálculo I' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Código da disciplina', example: 'MAT-101' })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiPropertyOptional({
    description: 'Ementa ou plano de ensino da disciplina',
  })
  @IsOptional()
  @IsString()
  syllabus?: string;

  @ApiProperty({ description: 'Carga horária total em horas', example: 60 })
  @IsInt()
  @IsNotEmpty()
  workload: number;

  @ApiProperty({ description: 'Quantidade de créditos acadêmicos', example: 4 })
  @IsInt()
  @IsNotEmpty()
  credits: number;

  @ApiProperty({
    description: 'Tipo da disciplina',
    enum: SubType,
    example: SubType.MANDATORY,
  })
  @IsEnum(SubType)
  @IsNotEmpty()
  type: SubType;
}
