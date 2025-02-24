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

    console.log('Fetching unmoderated properties...');

    const properties = await prisma.property.findMany({
      where: {
        AND: [
          { moderated: false },
          { rejected: false }
        ]
      },
      include: {
        images: true,
        documents: {
          select: {
            id: true,
            url: true,
            type: true
          }
        },
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

    console.log('Properties with documents:', properties.map(p => ({
      id: p.id,
      documentsCount: p.documents.length,
      documents: p.documents
    })));

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
} 