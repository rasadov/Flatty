import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await request.json();

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        favorites: {
          connect: { id: propertyId }
        }
      },
      include: {
        favorites: true
      }
    });

    return NextResponse.json({ success: true, favorites: user.favorites });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { propertyId } = await request.json();

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        favorites: {
          disconnect: { id: propertyId }
        }
      },
      include: {
        favorites: true
      }
    });

    return NextResponse.json({ success: true, favorites: user.favorites });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
} 