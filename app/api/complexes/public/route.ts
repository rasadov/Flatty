import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const complexes = await prisma.complex.findMany({
      where: {
        moderated: true,
        rejected: false,
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
        createdAt: 'desc',
      },
    });

    return NextResponse.json(complexes);
  } catch (error) {
    console.error('Error fetching public complexes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complexes' },
      { status: 500 }
    );
  }
} 