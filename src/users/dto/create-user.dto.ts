import {
  IsString,
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsUUID,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'Administrador Central' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'admin@faculdade.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'SenhaForte123', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;

  @ApiProperty({
    description: 'ID da instituição à qual este usuário pertencerá',
  })
  @IsUUID()
  @IsNotEmpty()
  institutionId: string;
}
