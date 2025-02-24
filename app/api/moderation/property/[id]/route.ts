import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rating } = await request.json();
    console.log('Approving property:', params.id, 'with rating:', rating);

    const property = await prisma.property.update({
      where: { id: params.id },
      data: { 
        moderated: true,
        propertyRating: rating
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

    console.log('Property approved successfully');
    return NextResponse.json(property);
  } catch (error) {
    console.error('Error approving property:', error);
    return NextResponse.json(
      { error: 'Failed to approve property' },
      { status: 500 }
    );
  }
} 