import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        listingLimit: true,
        listings: {
          select: {
            id: true
          }
        }
      }
    });

    if (!user) {
      return new NextResponse('User not found', { status: 404 });
    }

    // Для seller возвращаем информацию о лимите
    if (user.role === 'seller') {
      return NextResponse.json({
        count: user.listings.length, // Общее количество объектов (включая на модерации)
        maxLimit: user.listingLimit?.maxLimit || 3
      });
    }

    // Для остальных ролей возвращаем null (нет лимита)
    return NextResponse.json(null);
  } catch (error) {
    console.error('Error fetching listing limit:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 