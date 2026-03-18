import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateClassSubjectDto {
  @ApiPropertyOptional({
    description: 'ID da Instituição (Injetado automaticamente)',
  })
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @ApiProperty({ description: 'ID da Turma Base (ClassGroup)' })
  @IsUUID()
  @IsNotEmpty()
  classGroupId: string;

  @ApiProperty({ description: 'ID da Disciplina/Matéria (Subject)' })
  @IsUUID()
  @IsNotEmpty()
  subjectId: string;

  @ApiPropertyOptional({
    description: 'ID do Professor que vai ministrar a aula',
  })
  @IsOptional()
  @IsUUID()
  teacherId?: string;

  @ApiPropertyOptional({
    description: 'Sala de aula física ou link virtual',
    example: 'Sala 302 - Bloco B',
  })
  @IsOptional()
  @IsString()
  room?: string;

  @ApiProperty({
    description: 'Quantidade total de vagas disponíveis para esta matéria',
    example: 40,
  })
  @IsInt()
  @Min(1)
  @IsNotEmpty()
  totalSeats: number;
}
