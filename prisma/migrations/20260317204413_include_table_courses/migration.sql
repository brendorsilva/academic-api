-- CreateTable
CREATE TABLE `courses` (
    `id` VARCHAR(191) NOT NULL,
    `institutionId` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `code` VARCHAR(191) NOT NULL,
    `modality` ENUM('PRESENTIAL', 'EAD', 'HYBRID') NOT NULL,
    `level` ENUM('BASIC', 'HIGH_SCHOOL', 'TECHNICAL', 'GRADUATION', 'POSTGRADUATION') NOT NULL,
    `workload` INTEGER NOT NULL,
    `durationPeriods` INTEGER NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `coordinatorId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
