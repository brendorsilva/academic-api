-- AddForeignKey
ALTER TABLE `class_subjects` ADD CONSTRAINT `class_subjects_teacherId_fkey` FOREIGN KEY (`teacherId`) REFERENCES `teachers`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
