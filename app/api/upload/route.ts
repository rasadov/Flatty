import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { s3Client, bucketName, s3UploadConfig } from '@/lib/s3';
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Создаем уникальное имя файла
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const extension = file.name.split('.').pop()?.toLowerCase();
    const key = `properties/${uniqueId}.${extension}`;

    // Добавляем ACL при загрузке
    await s3Client.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: key,
        Body: buffer,
        ContentType: file.type,
        ACL: 'public-read', // Делаем файл публично доступным
      })
    );

    // Формируем URL изображения
    const imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;

    console.log('File info:', {
      name: file.name,
      type: file.type,
      size: file.size
    });

    console.log('S3 upload params:', {
      Bucket: bucketName,
      Key: key,
      ContentType: file.type
    });

    console.log('Generated URL:', imageUrl);

    return NextResponse.json({ url: imageUrl });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    );
  }
} 