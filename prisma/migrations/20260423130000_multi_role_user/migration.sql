-- CreateTable
CREATE TABLE `user_roles` (
    `id`     VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `role`   ENUM('ADMIN', 'COORDINATOR', 'TEACHER', 'STUDENT') NOT NULL,

    UNIQUE INDEX `user_roles_userId_role_key`(`userId`, `role`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_roles` ADD CONSTRAINT `user_roles_userId_fkey`
    FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- MigrateData: copia role existente de cada user para user_roles
INSERT INTO `user_roles` (`id`, `userId`, `role`)
SELECT UUID(), `id`, `role` FROM `users`;

-- AlterTable: remove coluna role
ALTER TABLE `users` DROP COLUMN `role`;
