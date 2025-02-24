export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q') || '';

    const properties = await prisma.property.findMany({
      where: {
        AND: [
          {
            moderated: true, // Только модерированные
            rejected: false, // Не отклоненные
          },
          {
            OR: [
              { title: { contains: query, mode: 'insensitive' } },
              { description: { contains: query, mode: 'insensitive' } },
              { location: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
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

    return Response.json(properties);
  } catch (error) {
    console.error('Error searching properties:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
} 