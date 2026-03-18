import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Shift } from '@prisma/client';

export class CreateClassGroupDto {
  @ApiPropertyOptional({
    description: 'ID da Instituição (Injetado automaticamente)',
  })
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @ApiProperty({ description: 'ID do Curso associado' })
  @IsUUID()
  @IsNotEmpty()
  courseId: string;

  @ApiProperty({ description: 'ID do Período Letivo associado' })
  @IsUUID()
  @IsNotEmpty()
  periodId: string;

  @ApiProperty({
    description: 'Nome ou identificação da turma',
    example: '1º Ano A - Manhã',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Turno da turma',
    enum: Shift,
    example: Shift.MORNING,
  })
  @IsEnum(Shift)
  @IsNotEmpty()
  shift: Shift;

  @ApiPropertyOptional({
    description: 'Status de atividade da turma',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
