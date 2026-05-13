import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

// Uma interface simples para tipar o que esperamos de dentro do token
export interface JwtPayload {
  sub: string;
  email: string;
  institutionId: string;
  roles: string[];
  teacherId?: string;
  studentId?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') ?? '',
    });
  }

  // Se o token for válido e não estiver expirado, o Nest executa esse método.
  // O retorno daqui é injetado automaticamente em `req.user`
  async validate(payload: JwtPayload) {
    return {
      userId: payload.sub,
      email: payload.email,
      institutionId: payload.institutionId,
      roles: payload.roles,
      teacherId: payload.teacherId,
      studentId: payload.studentId,
    };
  }
}
