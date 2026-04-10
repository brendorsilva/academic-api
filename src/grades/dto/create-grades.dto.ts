import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGradeDto {
  @ApiProperty({ example: 'uuid-do-enrollment-subject' })
  @IsString()
  @IsNotEmpty()
  enrollmentSubjectId!: string;

  @ApiProperty({ example: 'AV1', description: 'Nome/rótulo da avaliação' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ example: 8.5, minimum: 0, maximum: 10 })
  @IsNumber()
  @Min(0)
  @Max(10)
  value!: number;

  @ApiPropertyOptional({ example: 1.0, description: 'Peso da nota na média' })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ example: '2026-03-15' })
  @IsDateString()
  date!: string;

  @ApiPropertyOptional({
    example: 1,
    description:
      'Período avaliativo (1-4 para bimestral, 1-3 trimestral, 1-2 semestral)',
  })
  @IsInt()
  @Min(1)
  @Max(4)
  @IsOptional()
  period?: number;
}

export class UpdateGradeDto {
  @ApiProperty({ example: 9.0 })
  @IsNumber()
  @Min(0)
  @Max(10)
  value!: number;

  @ApiPropertyOptional({ example: 'Correção de erro de digitação' })
  @IsString()
  @IsOptional()
  reason?: string;
}

// DTO para cada item do lançamento em lote
export class BatchGradeItemDto {
  @ApiProperty({ example: 'uuid-do-enrollment-subject' })
  @IsString()
  @IsNotEmpty()
  enrollmentSubjectId!: string;

  @ApiProperty({ example: 8.5 })
  @IsNumber()
  @Min(0)
  @Max(10)
  value!: number;
}

// DTO principal para lançamento em lote (caderno de notas)
export class BatchGradeDto {
  @ApiProperty({
    example: 'uuid-da-class-subject',
    description: 'ID da oferta de disciplina (ClassSubject)',
  })
  @IsString()
  @IsNotEmpty()
  classSubjectId!: string;

  @ApiProperty({
    example: 1,
    description: 'Período avaliativo (ex: 1 = 1º Bimestre)',
  })
  @IsInt()
  @Min(1)
  @Max(4)
  period!: number;

  @ApiProperty({
    example: 'AV1',
    description: 'Nome/rótulo da avaliação para todos os alunos deste lote',
  })
  @IsString()
  @IsNotEmpty()
  gradeName!: string;

  @ApiPropertyOptional({ example: 1.0 })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({ example: '2026-03-15' })
  @IsDateString()
  date!: string;

  @ApiProperty({
    type: [BatchGradeItemDto],
    description: 'Lista de notas por aluno',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchGradeItemDto)
  grades!: BatchGradeItemDto[];
}
