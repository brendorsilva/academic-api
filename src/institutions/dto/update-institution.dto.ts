import { PartialType, OmitType, ApiProperty } from '@nestjs/swagger';
import { CreateInstitutionDto } from './create-institution.dto';
import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateInstitutionDto extends PartialType(
  OmitType(CreateInstitutionDto, ['cnpj'] as const),
) {
  @ApiProperty({
    description: 'Define se a instituição está ativa no sistema',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
