import { NextResponse } from 'next/server';
export const dynamic = 'force-dynamic';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const properties = await prisma.property.findMany({
      where: {
        ownerId: session.user.id
      },
      include: {
        ratings: true,
        likedBy: true,
        owner: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedProperties = properties.map((property: any) => ({
      ...property,
      coverImage: property.coverImage || property.images[0],
      images: property.images,
    }));

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}