import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const data = await request.json();
    const { propertyId, complexId } = data;

    if (!propertyId && !complexId) {
      return new Response('Property ID or Complex ID is required', { status: 400 });
    }

    const favorite = await prisma.favorite.create({
      data: {
        userId: session.user.id,
        propertyId,
        complexId,
      },
    });

    return Response.json(favorite);
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 