import {
  IsString,
  IsNotEmpty,
  IsDateString,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateClassDiaryDto {
  @IsString()
  @IsNotEmpty()
  classSubjectId: string;

  @IsDateString()
  date: string;

  @IsString()
  @IsNotEmpty()
  content: string;
}
