-- CreateTable
CREATE TABLE `class_groups` (
    `id` VARCHAR(191) NOT NULL,
    `institutionId` VARCHAR(191) NOT NULL,
    `courseId` VARCHAR(191) NOT NULL,
    `periodId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `shift` ENUM('MORNING', 'AFTERNOON', 'NIGHT', 'FULL_TIME') NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `class_groups` ADD CONSTRAINT `class_groups_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `courses`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `class_groups` ADD CONSTRAINT `class_groups_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `academic_periods`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
