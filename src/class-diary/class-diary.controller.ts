import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Patch,
  UseGuards,
} from '@nestjs/common';

import { CreateClassDiaryDto } from './dto/create-class-diary.dto';
import { UpdateAttendancesDto } from './dto/update-attendance.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { Role } from '@prisma/client';
import { CurrentUser } from '../auth/current-user.decorator';
import { ClassDiaryService } from './class-diary.service';

@Controller('class-diaries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClassDiaryController {
  constructor(private readonly classDiariesService: ClassDiaryService) {}

  @Post()
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TEACHER)
  create(@Body() createDto: CreateClassDiaryDto, @CurrentUser() user: any) {
    return this.classDiariesService.create(createDto, user);
  }

  @Patch(':id/attendance')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TEACHER)
  updateAttendances(
    @Param('id') id: string,
    @Body() updateDto: UpdateAttendancesDto,
    @CurrentUser() user: any,
  ) {
    return this.classDiariesService.updateAttendances(id, updateDto, user);
  }

  @Get('class-subject/:classSubjectId')
  @Roles(Role.ADMIN, Role.COORDINATOR, Role.TEACHER, Role.STUDENT)
  findByClassSubject(
    @Param('classSubjectId') classSubjectId: string,
    @CurrentUser() user: any,
  ) {
    return this.classDiariesService.findByClassSubject(classSubjectId, user);
  }
}
