import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { InstitutionsService } from './institutions.service';
import { CreateInstitutionDto } from './dto/create-institution.dto';
import { UpdateInstitutionDto } from './dto/update-institution.dto';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Institutions')
@Controller('institutions')
export class InstitutionsController {
  constructor(private readonly institutionsService: InstitutionsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma nova instituição' })
  create(@Body() createInstitutionDto: CreateInstitutionDto) {
    return this.institutionsService.create(createInstitutionDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as instituições' })
  findAll() {
    return this.institutionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Listar uma instituição' })
  findOne(@Param('id') id: string) {
    return this.institutionsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar uma instituição' })
  update(
    @Param('id') id: string,
    @Body() updateInstitutionDto: UpdateInstitutionDto,
  ) {
    return this.institutionsService.update(id, updateInstitutionDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Inativa uma instituição' })
  remove(@Param('id') id: string) {
    return this.institutionsService.remove(id);
  }
}
