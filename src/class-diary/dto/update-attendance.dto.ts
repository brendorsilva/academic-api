import {
  IsString,
  IsNotEmpty,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AttendanceRecordDto {
  @IsString()
  @IsNotEmpty()
  enrollmentSubjectId: string;

  @IsBoolean()
  isPresent: boolean;

  @IsString()
  @IsOptional()
  justification?: string;
}

export class UpdateAttendancesDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceRecordDto) // Garante que cada item do array seja validado
  attendances: AttendanceRecordDto[];
}
