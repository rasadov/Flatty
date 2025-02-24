import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        favoriteComplexes: {
          disconnect: { id: params.id }
        }
      }
    });

    return new Response('Favorite removed', { status: 200 });
  } catch (error) {
    console.error('Error removing favorite complex:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 