import { Module } from '@nestjs/common';
import { AcademicPeriodsService } from './academic-periods.service';
import { AcademicPeriodsController } from './academic-periods.controller';

@Module({
  controllers: [AcademicPeriodsController],
  providers: [AcademicPeriodsService],
})
export class AcademicPeriodsModule {}
