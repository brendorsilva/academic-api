import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEmail,
  IsEnum,
  IsDate,
  IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Title, Gender, Qualification } from '@prisma/client';

export class CreateTeacherDto {
  @IsOptional()
  @IsString()
  institutionId?: string;

  @ApiPropertyOptional({ description: 'URL da imagem hospedada no Cloudinary' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ enum: Title, example: Title.PROF })
  @IsOptional()
  @IsEnum(Title)
  title?: Title;

  @ApiProperty({ example: 'Carlos Mendes' })
  @IsString()
  @IsNotEmpty()
  fullName: string;

  @ApiProperty({ enum: Gender, example: Gender.MALE })
  @IsEnum(Gender)
  gender: Gender;

  @ApiProperty({
    example: '1980-05-15',
    description: 'Data de nascimento no formato YYYY-MM-DD',
  })
  @Type(() => Date)
  @IsDate()
  birthDate: Date;

  @ApiPropertyOptional({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  // --- Documentos ---
  @ApiProperty({ example: 'MG-10.222.333' })
  @IsString()
  @IsNotEmpty()
  rg: string;

  @ApiProperty({ example: '11122233344' })
  @IsString()
  @IsNotEmpty()
  cpf: string;

  @ApiPropertyOptional({ example: '1234567' })
  @IsOptional()
  @IsString()
  ctpsNumber?: string;

  @ApiPropertyOptional({ example: '001-MG' })
  @IsOptional()
  @IsString()
  ctpsSeries?: string;

  @ApiPropertyOptional({ example: '123.45678.90-1' })
  @IsOptional()
  @IsString()
  pis?: string;

  // --- Contato ---
  @ApiProperty({ example: '31988887777' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'carlos.mendes@escola.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  // --- Endereço ---
  @ApiProperty({ example: 'MG' })
  @IsString()
  @IsNotEmpty()
  state: string;

  @ApiProperty({ example: 'Belo Horizonte' })
  @IsString()
  @IsNotEmpty()
  city: string;

  @ApiProperty({ example: 'Savassi' })
  @IsString()
  @IsNotEmpty()
  neighborhood: string;

  @ApiProperty({ example: '30111-222' })
  @IsString()
  @IsNotEmpty()
  zipCode: string;

  @ApiProperty({ example: 'Avenida Getúlio Vargas' })
  @IsString()
  @IsNotEmpty()
  street: string;

  @ApiProperty({ example: '1500' })
  @IsString()
  @IsNotEmpty()
  number: string;

  // --- Acadêmico ---
  @ApiProperty({ enum: Qualification, example: Qualification.MASTER })
  @IsEnum(Qualification)
  qualification: Qualification;

  // --- Filiação ---
  @ApiPropertyOptional({ example: 'José Mendes' })
  @IsOptional()
  @IsString()
  fatherName?: string;

  @ApiProperty({ example: 'Ana Mendes' })
  @IsString()
  @IsNotEmpty()
  motherName: string;
}
