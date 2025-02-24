import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const complexes = await prisma.complex.findMany({
      where: {
        rejected: true
      },
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(complexes);
  } catch (error) {
    console.error('Error fetching rejected complexes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complexes' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 