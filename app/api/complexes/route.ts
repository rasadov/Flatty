import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { complexSchema } from '@/types/complex';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { 
        complexes: true
      }
    });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    if (!['builder', 'admin'].includes(user.role)) {
      return new Response('Only builders and admins can create complexes', { status: 403 });
    }

    // Проверяем лимит для builder
    if (user.role === 'builder' && user.complexes.length >= 100) {
      return new Response('You have reached your complex limit', { status: 403 });
    }

    const data = await req.json();
    const validatedData = complexSchema.parse(data);

    const complex = await prisma.complex.create({
      data: {
        ...validatedData,
        ownerId: session.user.id,
        images: {
          create: validatedData.images
        }
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
    });

    return Response.json(complex);
  } catch (error) {
    console.error('Error creating complex:', error);
    if (error.name === 'ZodError') {
      return new Response(JSON.stringify({ message: 'Invalid data format', details: error.errors }), 
        { status: 400 });
    }
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '24');
    const skip = (page - 1) * limit;

    // Базовые условия фильтрации
    const where = {
      moderated: true,
      rejected: false,
    };

    // Добавляем фильтры из параметров запроса
    if (searchParams.get('location')) {
      where['location'] = {
        contains: searchParams.get('location'),
        mode: 'insensitive'
      };
    }

    if (searchParams.get('status')) {
      where['status'] = searchParams.get('status');
    }

    if (searchParams.get('type')) {
      where['type'] = searchParams.get('type');
    }

    // Булевы фильтры
    if (searchParams.get('installment') === 'true') {
      where['installment'] = true;
    }
    if (searchParams.get('parking') === 'true') {
      where['parking'] = true;
    }
    if (searchParams.get('swimmingPool') === 'true') {
      where['swimmingPool'] = true;
    }
    if (searchParams.get('gym') === 'true') {
      where['gym'] = true;
    }

    // Фильтр по цене
    const minPrice = parseFloat(searchParams.get('minPrice') || '0');
    const maxPrice = parseFloat(searchParams.get('maxPrice') || '999999999');
    if (minPrice > 0 || maxPrice < 999999999) {
      where['price'] = {
        gte: minPrice,
        lte: maxPrice
      };
    }

    const complexes = await prisma.complex.findMany({
      where,
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
      skip,
      take: limit,
    });

    return NextResponse.json(complexes);
  } catch (error) {
    console.error('Error fetching complexes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch complexes' },
      { status: 500 }
    );
  }
} 