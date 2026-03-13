import { Injectable } from '@nestjs/common';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';

@Injectable()
export class CloudinaryService {
  uploadImage(
    fileBuffer: Buffer,
    fileName: string,
    folderName: string,
  ): Promise<UploadApiResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: `academic_api/${folderName}`,
          public_id: fileName,
          overwrite: true,
        },
        (error, result) => {
          if (error) return reject(error);
          if (!result)
            return reject(
              new Error('Erro desconhecido: Resultado vazio do Cloudinary'),
            );

          resolve(result);
        },
      );

      streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
  }
}
