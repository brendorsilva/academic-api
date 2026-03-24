import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

// Uma interface simples para tipar o que esperamos de dentro do token
export interface JwtPayload {
  sub: string;
  email: string;
  institutionId: string;
  role: string;
  teacherId?: string;
  studentId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      // Extrai o token do cabeçalho de Autorização (Bearer Token)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false, // Rejeita tokens expirados
      secretOrKey:
        process.env.JWT_SECRET || 'super-secret-key-mudar-em-producao',
    });
  }

  // Se o token for válido e não estiver expirado, o Nest executa esse método.
  // O retorno daqui é injetado automaticamente em `req.user`
  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      institutionId: payload.institutionId,
      role: payload.role,
      teacherId: payload.teacherId,
      studentId: payload.studentId,
    };
  }
}
