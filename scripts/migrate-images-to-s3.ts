import { prisma } from '@/lib/prisma';
import { s3Client, bucketName } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import fetch from 'node-fetch';
import crypto from 'crypto';

async function migrateImagesToS3() {
  // Получаем все объекты с локальными изображениями
  const properties = await prisma.property.findMany({
    where: {
      OR: [
        { coverImage: { startsWith: '/uploads/' } },
        { images: { hasSome: ['/uploads/'] } }
      ]
    }
  });

  for (const property of properties) {
    try {
      // Обрабатываем coverImage
      if (property.coverImage?.startsWith('/uploads/')) {
        const newUrl = await migrateImage(property.coverImage);
        await prisma.property.update({
          where: { id: property.id },
          data: { coverImage: newUrl }
        });
      }

      // Обрабатываем остальные изображения
      if (property.images) {
        const newImages = await Promise.all(
          property.images.map(async (img) => {
            if (img.startsWith('/uploads/')) {
              return await migrateImage(img);
            }
            return img;
          })
        );

        await prisma.property.update({
          where: { id: property.id },
          data: { images: newImages }
        });
      }
    } catch (error) {
      console.error(`Error migrating property ${property.id}:`, error);
    }
  }
}

async function migrateImage(localPath: string) {
  const response = await fetch(`http://localhost:3000${localPath}`);
  const buffer = await response.buffer();

  const uniqueId = crypto.randomBytes(16).toString('hex');
  const extension = localPath.split('.').pop()?.toLowerCase();
  const key = `migrated/${uniqueId}.${extension}`;

  await s3Client.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: buffer,
      ContentType: `image/${extension}`
    })
  );

  return `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
}

migrateImagesToS3()
  .then(() => console.log('Migration completed'))
  .catch(console.error)
  .finally(() => prisma.$disconnect()); 