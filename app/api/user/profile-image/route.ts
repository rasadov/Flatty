import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('Unauthorized attempt to update profile image');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl } = await request.json();
    console.log('Received image URL:', imageUrl);
    console.log('User ID:', session.user.id);

    // Проверяем существующего пользователя
    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, image: true }
    });
    console.log('Current user data:', currentUser);

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { 
        image: imageUrl 
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
      },
    });
    console.log('Updated user data:', updatedUser);

    // Проверяем обновление в базе
    const verifyUpdate = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, image: true }
    });
    console.log('Verification after update:', verifyUpdate);

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile image:', error);
    return NextResponse.json(
      { error: 'Failed to update profile image' },
      { status: 500 }
    );
  }
} 