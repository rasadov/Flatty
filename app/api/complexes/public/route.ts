import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
    };

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
            image: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(complexes, { headers });
  } catch (error) {
    console.error('Error getting public complexes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public complexes' },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store, max-age=0',
        }
      }
    );
  }
} 