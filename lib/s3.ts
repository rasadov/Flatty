import { S3Client } from '@aws-sdk/client-s3';

if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
  throw new Error('AWS credentials are not properly configured');
}

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

export const bucketName = process.env.AWS_BUCKET_NAME;

// Добавляем конфигурацию ACL при загрузке
export const s3UploadConfig = {
  ACL: 'public-read' // Делаем файлы публично доступными для чтения
}; 