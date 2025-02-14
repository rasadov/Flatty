import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' }, 
        { status: 401 }
      );
    }

    const data = await request.json();
    console.log('Received data:', data);

    const property = await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        location: data.location,
        type: data.type,
        status: data.status === 'for-sale' ? 'sale' : 'rent',
        bedrooms: data.specs.beds,
        bathrooms: data.specs.baths,
        area: data.specs.area,
        coverImage: data.coverImage,
        images: {
          create: data.images.map((url: string) => ({
            url: url
          }))
        },
        specs: data.specs,
        features: data.features || [],
        yearBuilt: data.specs.yearBuilt ? Number(data.specs.yearBuilt) : null,
        furnished: Boolean(data.specs.furnished),
        parking: Boolean(data.specs.parking),
        petsAllowed: false,
        latitude: data.latitude || null,
        longitude: data.longitude || null,
        views: 0,
        averageRating: 0,
        totalRatings: 0,
        owner: {
          connect: {
            id: session.user.id
          }
        },
      },
      include: {
        images: true,
        ratings: true,
        owner: true
      }
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property', details: error.message },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const properties = await prisma.property.findMany({
      include: {
        images: true,
        ratings: true,
        owner: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedProperties = properties.map(property => {
      const formattedProperty = {
        id: property.id,
        title: property.title,
        description: property.description,
        price: property.price,
        location: property.location,
        type: property.type,
        status: property.status,
        specs: {
          beds: property.bedrooms,
          baths: property.bathrooms,
          area: property.area,
        },
        coverImage: property.coverImage,
        images: property.images.map(img => img.url),
        ratings: property.ratings,
        createdAt: property.createdAt,
      };

      return formattedProperty;
    });

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
} 