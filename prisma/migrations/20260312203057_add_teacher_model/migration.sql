-- CreateTable
CREATE TABLE `teachers` (
    `id` VARCHAR(191) NOT NULL,
    `institutionId` VARCHAR(191) NOT NULL,
    `photoUrl` VARCHAR(191) NULL,
    `title` ENUM('SR', 'SRA', 'PROF', 'DR', 'DRA') NULL,
    `fullName` VARCHAR(191) NOT NULL,
    `gender` ENUM('MALE', 'FEMALE') NOT NULL,
    `birthDate` DATE NOT NULL,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `rg` VARCHAR(191) NOT NULL,
    `cpf` VARCHAR(191) NOT NULL,
    `ctpsNumber` VARCHAR(191) NULL,
    `ctpsSeries` VARCHAR(191) NULL,
    `pis` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `state` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `neighborhood` VARCHAR(191) NOT NULL,
    `zipCode` VARCHAR(191) NOT NULL,
    `street` VARCHAR(191) NOT NULL,
    `number` VARCHAR(191) NOT NULL,
    `qualification` ENUM('TITULATION', 'GRADUATION', 'SPECIALIZATION', 'MASTER', 'DOCTORATE') NOT NULL,
    `fatherName` VARCHAR(191) NULL,
    `motherName` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `teachers_cpf_institutionId_key`(`cpf`, `institutionId`),
    UNIQUE INDEX `teachers_email_institutionId_key`(`email`, `institutionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `teachers` ADD CONSTRAINT `teachers_institutionId_fkey` FOREIGN KEY (`institutionId`) REFERENCES `institutions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
