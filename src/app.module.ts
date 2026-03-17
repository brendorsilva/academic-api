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
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
