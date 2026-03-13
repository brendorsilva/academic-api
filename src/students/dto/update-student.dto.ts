import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateStudentDto } from './create-student.dto';

// Omitimos o institutionId e o cpf para impedir que sejam alterados acidentalmente ou de forma maliciosa
export class UpdateStudentDto extends PartialType(
  OmitType(CreateStudentDto, ['institutionId', 'cpf'] as const),
) {}
