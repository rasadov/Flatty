import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.savedProperty.create({
      data: {
        userId: session.user.id,
        propertyId: params.id,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving property:', error);
    return NextResponse.json(
      { error: 'Failed to save property' },
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
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await prisma.savedProperty.delete({
      where: {
        userId_propertyId: {
          userId: session.user.id,
          propertyId: params.id,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing saved property:', error);
    return NextResponse.json(
      { error: 'Failed to remove saved property' },
      { status: 500 }
    );
  }
} 