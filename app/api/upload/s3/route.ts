import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { s3Client, bucketName } from '@/lib/s3';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Логируем информацию о файле
    console.log('File info:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем уникальное имя файла
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const extension = file.name.split('.').pop()?.toLowerCase();
    const key = `properties/${uniqueId}.${extension}`;

    // Логируем параметры запроса к S3
    console.log('S3 upload params:', {
      Bucket: bucketName,
      Key: key,
      ContentType: file.type
    });

    try {
      // Загружаем файл в S3
      await s3Client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: buffer,
          ContentType: file.type,
          // ACL: 'public-read', // Добавляем это для публичного доступа
        })
      );

      // Формируем URL изображения
      const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
      console.log('Generated URL:', imageUrl);

      return NextResponse.json({ url: imageUrl });
    } catch (s3Error) {
      console.error('S3 upload error:', s3Error);
      throw s3Error;
    }
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 