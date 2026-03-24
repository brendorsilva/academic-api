import { Module } from '@nestjs/common';
import { ClassDiaryService } from './class-diary.service';
import { ClassDiaryController } from './class-diary.controller';

@Module({
  providers: [ClassDiaryService],
  controllers: [ClassDiaryController],
  exports: [ClassDiaryService],
})
export class ClassDiaryModule {}
