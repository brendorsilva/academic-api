import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnrollmentDto {
  @ApiPropertyOptional({
    description: 'ID da Instituição (Injetado automaticamente)',
  })
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @ApiProperty({ description: 'ID do Aluno' })
  @IsUUID()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({ description: 'ID da Turma Base (ClassGroup)' })
  @IsUUID()
  @IsNotEmpty()
  classGroupId: string;

  @ApiPropertyOptional({
    description:
      'Lista de IDs das Ofertas de Disciplinas (ClassSubjects). Se vazio, matricula em todas as matérias da turma.',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  classSubjectIds?: string[];
}
