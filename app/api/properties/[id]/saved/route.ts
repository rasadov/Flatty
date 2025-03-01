import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ isSaved: false });
    }

    const savedProperty = await prisma.savedProperty.findUnique({
      where: {
        userId_propertyId: {
          userId: session.user.id,
          propertyId: params.id,
        },
      },
    });

    return NextResponse.json({ isSaved: !!savedProperty });
  } catch (error) {
    console.error('Error checking saved property:', error);
    return NextResponse.json(
      { error: 'Failed to check saved property' },
      { status: 500 }
    );
  }
} 