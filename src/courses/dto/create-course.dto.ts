import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  IsBoolean,
  IsEnum,
} from 'class-validator';
import { Modality, Level } from '@prisma/client';

export class CreateCourseDto {
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsEnum(Modality)
  @IsNotEmpty()
  modality: Modality;

  @IsEnum(Level)
  @IsNotEmpty()
  level: Level;

  @IsInt()
  @IsNotEmpty()
  workload: number;

  @IsInt()
  @IsNotEmpty()
  durationPeriods: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsUUID()
  coordinatorId?: string;
}
