import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const { name, email, password, institutionId } = createUserDto;

    // 1. Verifica se a instituição existe
    const institution = await this.prisma.institution.findUnique({
      where: { id: institutionId },
    });

    if (!institution) {
      throw new NotFoundException('Instituição não encontrada.');
    }

    // 2. Verifica se o e-mail já está em uso
    const userExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (userExists) {
      throw new ConflictException('Este e-mail já está cadastrado.');
    }

    // 3. Criptografa a senha (o '10' é o salt rounds, padrão recomendado)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Salva no banco de dados
    const user = await this.prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        institutionId,
      },
    });

    // 5. Remove a senha do objeto de retorno por segurança
    const { password: _, ...userWithoutPassword } = user;

    return userWithoutPassword;
  }
}
