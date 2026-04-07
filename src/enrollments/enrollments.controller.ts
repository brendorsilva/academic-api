import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiQuery,
} from '@nestjs/swagger';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { Roles } from 'src/auth/roles.decorator';
import { Role } from '@prisma/client';

@ApiTags('Enrollments (Matrículas)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('enrollments')
export class EnrollmentsController {
  constructor(private readonly enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles(Role.ADMIN, Role.COORDINATOR)
  create(
    @Body() createEnrollmentDto: CreateEnrollmentDto,
    @CurrentUser() user: any,
  ) {
    return this.enrollmentsService.create(createEnrollmentDto, user);
  }

  @Get()
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.STUDENT)
  findAll(
    @CurrentUser() user: any,
    @Query('classGroupId') classGroupId?: string,
    @Query('studentId') studentId?: string,
  ) {
    return this.enrollmentsService.findAll(user, classGroupId, studentId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhes completos de uma Matrícula' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.enrollmentsService.findOne(id, user);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Cancelar/Excluir Matrícula (Apenas para correção de erros)',
  })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.enrollmentsService.remove(id, user);
  }
}
