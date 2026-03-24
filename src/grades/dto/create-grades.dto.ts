import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsDateString,
  IsOptional,
  Min,
  Max,
} from 'class-validator';

export class CreateGradeDto {
  @IsString()
  @IsNotEmpty()
  enrollmentSubjectId: string; // ID da matrícula do aluno na disciplina

  @IsString()
  @IsNotEmpty()
  name: string; // Ex: "Prova 1", "Trabalho Final"

  @IsNumber()
  @Min(0)
  @Max(100) // Ajuste a nota máxima de acordo com a sua instituição (10 ou 100)
  value: number;

  @IsNumber()
  @IsOptional()
  weight?: number; // Peso da nota (padrão 1.0)

  @IsDateString()
  date: string;
}

export class UpdateGradeDto {
  @IsNumber()
  @Min(0)
  @Max(100)
  value: number;

  @IsString()
  @IsOptional()
  reason?: string; // Motivo da alteração (para sair no comprovativo)
}
