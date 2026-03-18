import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { AcademicPeriodsService } from './academic-periods.service';
import { CreateAcademicPeriodDto } from './dto/create-academic-period.dto';
import { UpdateAcademicPeriodDto } from './dto/update-academic-period.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Academic Periods (Períodos Letivos)')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('academic-periods')
export class AcademicPeriodsController {
  constructor(
    private readonly academicPeriodsService: AcademicPeriodsService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar um novo período letivo' })
  create(
    @Body() createAcademicPeriodDto: CreateAcademicPeriodDto,
    @CurrentUser() user: any,
  ) {
    createAcademicPeriodDto.institutionId = user.institutionId;
    return this.academicPeriodsService.create(createAcademicPeriodDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os períodos letivos da instituição' })
  findAll(@CurrentUser() user: any) {
    return this.academicPeriodsService.findAll(user.institutionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Procurar um período letivo específico' })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.academicPeriodsService.findOne(id, user.institutionId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar os dados de um período letivo' })
  update(
    @Param('id') id: string,
    @Body() updateAcademicPeriodDto: UpdateAcademicPeriodDto,
    @CurrentUser() user: any,
  ) {
    delete updateAcademicPeriodDto.institutionId;
    return this.academicPeriodsService.update(
      id,
      updateAcademicPeriodDto,
      user.institutionId,
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Excluir um período letivo' })
  remove(@Param('id') id: string, @CurrentUser() user: any) {
    return this.academicPeriodsService.remove(id, user.institutionId);
  }
}
