import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsBoolean,
  IsNumber,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { FinancialAccountType } from '@prisma/client';

export class CreateFinancialAccountDto {
  @ApiProperty({ example: 'Caixa Principal' })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ enum: FinancialAccountType, example: FinancialAccountType.CASH })
  @IsEnum(FinancialAccountType)
  type!: FinancialAccountType;

  @ApiPropertyOptional({ example: 'Caixa físico da recepção' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 0, default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  initialBalance?: number;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateFinancialAccountDto {
  @ApiPropertyOptional({ example: 'Caixa Principal' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiPropertyOptional({ enum: FinancialAccountType })
  @IsOptional()
  @IsEnum(FinancialAccountType)
  type?: FinancialAccountType;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
