import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const favorites = await prisma.property.findMany({
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
    console.error('Error fetching favorite properties:', error);
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
    const propertyId = searchParams.get('id');

    if (!propertyId) {
      return new Response('Property ID is required', { status: 400 });
    }

    await prisma.favorite.delete({
      where: {
        userId_propertyId: {
          userId: session.user.id,
          propertyId: propertyId,
        },
      },
    });

    return new Response('Favorite removed', { status: 200 });
  } catch (error) {
    console.error('Error removing favorite property:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 