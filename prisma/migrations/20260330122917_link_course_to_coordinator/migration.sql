-- AddForeignKey
ALTER TABLE `courses` ADD CONSTRAINT `courses_coordinatorId_fkey` FOREIGN KEY (`coordinatorId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
