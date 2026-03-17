import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateStudentDto {
  @ApiProperty({ description: 'ID da instituição a qual o aluno pertence' })
  @IsUUID()
  @IsOptional()
  institutionId?: string;

  @ApiProperty({ example: 'João Silva' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ example: '12345678900' })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiProperty({ example: 'MG-12.345.678' })
  @IsString()
  @IsNotEmpty()
  rg: string;

  @ApiPropertyOptional({ example: 'José Silva' })
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiProperty({ example: 'Maria Silva' })
  @IsString()
  @IsNotEmpty()
  motherName: string;

  @ApiPropertyOptional({ description: 'URL da imagem hospedada no Cloudinary' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  // --- Endereço ---
  @ApiProperty({ example: 'SP' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'São Paulo' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Centro' })
  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @ApiProperty({ example: 'Rua das Flores' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: '123A' })
  @IsString()
  @IsNotEmpty()
  number: string;

  @ApiPropertyOptional({ description: 'Paróquia para instituições religiosas' })
  @IsOptional()
  @IsString()
  parish?: string;

  // --- Contato ---
  @ApiProperty({ example: 'joao@email.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: '11999999999' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: '11988888888' })
  @IsString()
  @IsNotEmpty()
  emergencyContact: string;

  // --- Saúde ---
  @ApiPropertyOptional({ example: 'Alergia a poeira e dipirona' })
  @IsOptional()
  @IsString()
  allergies?: string;

  @ApiPropertyOptional({ example: 'Intolerância à lactose' })
  @IsOptional()
  @IsString()
  dietaryRestrictions?: string;
}
