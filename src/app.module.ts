import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { ConfigModule } from '@nestjs/config';
import { InstitutionsModule } from './institutions/institutions.module';
import { StudentsModule } from './students/students.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CloudinaryModule } from './cloudinary/cloudinary.module';
import { TeachersModule } from './teachers/teachers.module';
import { CoursesModule } from './courses/courses.module';
import { SubjectsModule } from './subjects/subjects.module';
import { AcademicPeriodsModule } from './academic-periods/academic-periods.module';
import { ClassGroupsModule } from './class-groups/class-groups.module';
import { ClassSubjectsModule } from './class-subjects/class-subjects.module';
import { EnrollmentsModule } from './enrollments/enrollments.module';
import { ClassDiaryModule } from './class-diary/class-diary.module';
import { GradesModule } from './grades/grades.module';
import { FinancialCategoriesModule } from './financial-categories/financial-categories.module';
import { FinancialAccountsModule } from './financial-accounts/financial-accounts.module';
import { FinancialTransactionsModule } from './financial-transactions/financial-transactions.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    InstitutionsModule,
    StudentsModule,
    UsersModule,
    AuthModule,
    CloudinaryModule,
    TeachersModule,
    CoursesModule,
    SubjectsModule,
    AcademicPeriodsModule,
    ClassGroupsModule,
    ClassSubjectsModule,
    EnrollmentsModule,
    ClassDiaryModule,
    GradesModule,
    FinancialCategoriesModule,
    FinancialAccountsModule,
    FinancialTransactionsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
