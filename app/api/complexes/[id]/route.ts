import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { images, ...complexData } = data;
    
    const complex = await prisma.complex.findUnique({
      where: { id: params.id }
    });

    if (!complex) {
      return NextResponse.json({ error: 'Complex not found' }, { status: 404 });
    }

    if (complex.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Сначала удаляем старые изображения
    await prisma.image.deleteMany({
      where: { complexId: params.id }
    });

    const updatedComplex = await prisma.complex.update({
      where: { id: params.id },
      data: {
        ...complexData,
        // Создаем новые записи изображений
        images: {
          create: images.map(url => ({
            url: url,
          }))
        }
      },
      include: {
        images: true,
        owner: true
      }
    });

    return NextResponse.json(updatedComplex);
  } catch (error) {
    console.error('Error updating complex:', error);
    return NextResponse.json(
      { error: 'Failed to update complex' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const complex = await prisma.complex.findUnique({
      where: { id: params.id }
    });

    if (!complex) {
      return NextResponse.json({ error: 'Complex not found' }, { status: 404 });
    }

    if (complex.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await prisma.$transaction([
      prisma.image.deleteMany({
        where: { complexId: params.id }
      }),
      prisma.complex.delete({
        where: { id: params.id }
      })
    ]);

    return NextResponse.json({ message: 'Complex deleted successfully' });
  } catch (error) {
    console.error('Error deleting complex:', error);
    return NextResponse.json(
      { error: 'Failed to delete complex' },
      { status: 500 }
    );
  }
} 