import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { CreateUserAccessDto } from './dto/create-user-access.dto';

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

  async generateAccess(dto: CreateUserAccessDto, currentUser: any) {
    const { profileId, role, email, password } = dto;
    const institutionId = currentUser.institutionId;

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 1. Verifica se a pessoa já tem um utilizador vinculado
    const whereClause: any = { institutionId };
    if (role === 'TEACHER') whereClause.teacherId = profileId;
    if (role === 'STUDENT') whereClause.studentId = profileId;

    const existingUser = await this.prisma.user.findFirst({
      where: whereClause,
    });

    if (existingUser) {
      const updatedUser = await this.prisma.user.update({
        where: { id: existingUser.id },
        data: {
          email, // Atualiza o email caso o diretor tenha digitado um novo
          password: hashedPassword,
          mustChangePassword: true, // Obriga a trocar no próximo login!
        },
      });
      return {
        message: 'Senha resetada e acesso atualizado com sucesso.',
        user: updatedUser,
      };
    }

    // 3. Valida se o perfil (Aluno ou Professor) realmente existe na instituição
    let profileName = '';
    if (role === 'TEACHER') {
      const teacher = await this.prisma.teacher.findFirst({
        where: { id: profileId, institutionId },
      });
      if (!teacher) throw new NotFoundException('Professor não encontrado.');
      profileName = teacher.fullName;
    } else if (role === 'STUDENT') {
      const student = await this.prisma.student.findFirst({
        where: { id: profileId, institutionId },
      });
      if (!student) throw new NotFoundException('Aluno não encontrado.');
      profileName = student.fullName;
    }

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: profileName,
        role,
        institutionId,
        teacherId: role === 'TEACHER' ? profileId : null,
        studentId: role === 'STUDENT' ? profileId : null,
        mustChangePassword: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      }, // Não devolve a senha hashada por segurança
    });

    return newUser;
  }

  async updatePassword(userId: string, newPassword: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        mustChangePassword: false,
      },
    });

    return { message: 'Senha atualizada com sucesso.' };
  }
}
