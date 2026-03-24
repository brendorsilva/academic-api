/*
  Warnings:

  - A unique constraint covering the columns `[teacherId]` on the table `users` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[studentId]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `users` ADD COLUMN `role` ENUM('ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT') NOT NULL DEFAULT 'ADMIN',
    ADD COLUMN `studentId` VARCHAR(191) NULL,
    ADD COLUMN `teacherId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `class_diaries` (
    `id` VARCHAR(191) NOT NULL,
    `institutionId` VARCHAR(191) NOT NULL,
    `classSubjectId` VARCHAR(191) NOT NULL,
    `date` DATE NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `attendances` (
    `id` VARCHAR(191) NOT NULL,
    `institutionId` VARCHAR(191) NOT NULL,
    `classDiaryId` VARCHAR(191) NOT NULL,
    `enrollmentSubjectId` VARCHAR(191) NOT NULL,
    `isPresent` BOOLEAN NOT NULL DEFAULT true,
    `justification` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `attendances_classDiaryId_enrollmentSubjectId_key`(`classDiaryId`, `enrollmentSubjectId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grades` (
    `id` VARCHAR(191) NOT NULL,
    `institutionId` VARCHAR(191) NOT NULL,
    `enrollmentSubjectId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `value` DOUBLE NOT NULL,
    `weight` DOUBLE NOT NULL DEFAULT 1.0,
    `date` DATE NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `grade_audit_logs` (
    `id` VARCHAR(191) NOT NULL,
    `institutionId` VARCHAR(191) NOT NULL,
    `gradeId` VARCHAR(191) NULL,
    `userId` VARCHAR(191) NOT NULL,
    `action` ENUM('CREATED', 'UPDATED', 'DELETED') NOT NULL,
    `oldValue` DOUBLE NULL,
    `newValue` DOUBLE NULL,
    `reason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `users_teacherId_key` ON `users`(`teacherId`);

-- CreateIndex
CREATE UNIQUE INDEX `users_studentId_key` ON `users`(`studentId`);

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `users` ADD CONSTRAINT `users_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `students`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_diaries` ADD CONSTRAINT `class_diaries_classSubjectId_fkey` FOREIGN KEY (`classSubjectId`) REFERENCES `class_subjects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_classDiaryId_fkey` FOREIGN KEY (`classDiaryId`) REFERENCES `class_diaries`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `attendances` ADD CONSTRAINT `attendances_enrollmentSubjectId_fkey` FOREIGN KEY (`enrollmentSubjectId`) REFERENCES `enrollment_subjects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grades` ADD CONSTRAINT `grades_enrollmentSubjectId_fkey` FOREIGN KEY (`enrollmentSubjectId`) REFERENCES `enrollment_subjects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grade_audit_logs` ADD CONSTRAINT `grade_audit_logs_gradeId_fkey` FOREIGN KEY (`gradeId`) REFERENCES `grades`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `grade_audit_logs` ADD CONSTRAINT `grade_audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
