import { Module } from '@nestjs/common';
import { ClassGroupsService } from './class-groups.service';
import { ClassGroupsController } from './class-groups.controller';

@Module({
  controllers: [ClassGroupsController],
  providers: [ClassGroupsService],
})
export class ClassGroupsModule {}
