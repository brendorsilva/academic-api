-- CreateTable
CREATE TABLE `students` (
    `id` VARCHAR(191) NOT NULL,
    `institutionId` VARCHAR(191) NOT NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `rg` VARCHAR(191) NOT NULL,
    `fatherName` VARCHAR(191) NULL,
    `motherName` VARCHAR(191) NOT NULL,
    `photoUrl` VARCHAR(191) NULL,
    `state` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `neighborhood` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `parish` VARCHAR(191) NULL,
    `email` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `emergencyContact` VARCHAR(191) NOT NULL,
    `allergies` TEXT NULL,
    `dietaryRestrictions` TEXT NULL,
    `enrollmentNumber` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updateAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `students_cpf_institutionId_key`(`cpf`, `institutionId`),
    UNIQUE INDEX `students_email_institutionId_key`(`email`, `institutionId`),
    UNIQUE INDEX `students_enrollmentNumber_institutionId_key`(`enrollmentNumber`, `institutionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `students` ADD CONSTRAINT `students_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `institutions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
