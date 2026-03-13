import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'admin@faculdade.com' })
  @IsEmail({}, { message: 'Forneça um e-mail válido' })
  @IsNotEmpty({ message: 'O e-mail não pode estar vazio' })
  email: string;

  @ApiProperty({ example: 'SenhaForte123' })
  @IsString()
  @IsNotEmpty({ message: 'A senha não pode estar vazia' })
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;
}
