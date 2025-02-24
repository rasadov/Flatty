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
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверяем, запрашивает ли пользователь свои собственные свойства
    // или является ли он администратором
    const isOwnProfile = session.user.id === params.id;
    const isAdmin = session.user.role === 'admin';

    if (!isOwnProfile && !isAdmin) {
      // Если это чужой профиль и не админ, показываем только модерированные свойства
      const properties = await prisma.property.findMany({
        where: {
          ownerId: params.id,
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

      return NextResponse.json(properties);
    }

    // Для собственного профиля или админа показываем все свойства
    const properties = await prisma.property.findMany({
      where: {
        ownerId: params.id,
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

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching user properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
} 