import { Module } from '@nestjs/common';
import { FinancialCategoriesService } from './financial-categories.service';
import { FinancialCategoriesController } from './financial-categories.controller';

@Module({
  controllers: [FinancialCategoriesController],
  providers: [FinancialCategoriesService],
  exports: [FinancialCategoriesService],
})
export class FinancialCategoriesModule {}
