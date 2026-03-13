import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { InstitutionType } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInstitutionDto {
  @ApiProperty({
    description: 'O nome oficial da instituição acadêmica',
    example: 'Faculdade de Tecnologia Central',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'CNPJ válido e único da instituição',
    example: '12.345.678/0001-90',
  })
  @IsString()
  @IsNotEmpty()
  cnpj: string;

  @ApiProperty({
    description: 'Categoria da instituição',
    enum: InstitutionType,
    example: InstitutionType.UNIVERSITY,
  })
  @IsEnum(InstitutionType)
  type: InstitutionType;
}
