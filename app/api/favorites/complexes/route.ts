import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const favorites = await prisma.complex.findMany({
      where: {
        favorites: {
          some: {
            userId: session.user.id
          }
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

    return Response.json(favorites);
  } catch (error) {
    console.error('Error fetching favorite complexes:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const complexId = searchParams.get('id');

    if (!complexId) {
      return new Response('Complex ID is required', { status: 400 });
    }

    await prisma.favorite.delete({
      where: {
        userId_complexId: {
          userId: session.user.id,
          complexId: complexId,
        },
      },
    });

    return new Response('Favorite removed', { status: 200 });
  } catch (error) {
    console.error('Error removing favorite complex:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 