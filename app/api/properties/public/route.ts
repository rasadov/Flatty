import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    console.log('Загружаем объекты недвижимости из базы данных');
    const properties = await prisma.property.findMany({
      where: {
        moderated: true,
      },
      include: {
        images: true,
        agent: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching public properties:', error);
    return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
  }
} 