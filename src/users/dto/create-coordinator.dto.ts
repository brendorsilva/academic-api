import { PickType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class CreateCoordinatorDto extends PickType(CreateUserDto, [
  'name',
  'email',
  'password',
] as const) {}
