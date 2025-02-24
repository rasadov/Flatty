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

    console.log('Fetching approved properties...');

    const properties = await prisma.property.findMany({
      where: {
        AND: [
          { moderated: true },
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

    console.log(`Found ${properties.length} approved properties`);
    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching approved properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 