import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsEnum,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PeriodStatus } from '@prisma/client';

export class CreateAcademicPeriodDto {
  @ApiPropertyOptional({
    description: 'ID da Instituição (Injetado automaticamente pelo token)',
  })
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @ApiProperty({ description: 'Nome do período letivo', example: '2026.1' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Data de início do período',
    example: '2026-02-01T00:00:00.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  startDate: string;

  @ApiProperty({
    description: 'Data de término do período',
    example: '2026-07-15T23:59:59.000Z',
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    description: 'Status atual do período letivo',
    enum: PeriodStatus,
    example: PeriodStatus.ENROLLMENT_OPEN,
  })
  @IsEnum(PeriodStatus)
  @IsNotEmpty()
  status: PeriodStatus;
}
