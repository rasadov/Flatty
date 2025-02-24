import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Fetching unmoderated complexes...');

    const complexes = await prisma.complex.findMany({
      where: {
        AND: [
          { moderated: false },
          { rejected: false }
        ]
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

    console.log(`Found ${complexes.length} unmoderated complexes`);
    return NextResponse.json(complexes);
  } catch (error) {
    console.error('Error fetching unmoderated complexes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complexes' },
      { status: 500 }
    );
  }
} 