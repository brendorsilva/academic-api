import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Modality, Level, EvaluationType } from '@prisma/client';

export class CreateCourseDto {
  @ApiPropertyOptional({
    description:
      'ID da Instituição (Injetado automaticamente no backend pelo token)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @ApiProperty({
    description: 'Nome completo do curso',
    example: 'Engenharia de Software',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Código identificador do curso',
    example: 'ENG-SOFT-01',
  })
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty({
    description: 'Modalidade de ensino',
    enum: Modality,
    example: Modality.PRESENTIAL,
  })
  @IsEnum(Modality)
  @IsNotEmpty()
  modality: Modality;

  @ApiProperty({
    description: 'Nível de ensino',
    enum: Level,
    example: Level.GRADUATION,
  })
  @IsEnum(Level)
  @IsNotEmpty()
  level: Level;

  @ApiProperty({
    description: 'Carga horária total do curso em horas',
    example: 3600,
  })
  @IsInt()
  @IsNotEmpty()
  workload: number;

  @ApiProperty({
    description: 'Duração total em semestres ou anos',
    example: 8,
  })
  @IsInt()
  @IsNotEmpty()
  durationPeriods: number;

  @ApiPropertyOptional({
    description:
      'Tipo de avaliação: BIMESTRAL (4 períodos), TRIMESTRAL (3), SEMESTRAL (2), ANUAL (1). Padrão: BIMESTRAL.',
    enum: EvaluationType,
    example: EvaluationType.BIMESTRAL,
  })
  @IsEnum(EvaluationType)
  @IsOptional()
  evaluationType?: EvaluationType;

  @ApiPropertyOptional({
    description: 'Status de atividade do curso',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiPropertyOptional({
    description: 'ID do professor coordenador do curso (Opcional)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  coordinatorId?: string;
}
