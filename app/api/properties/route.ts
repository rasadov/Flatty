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
    console.log('Received data:', JSON.stringify(data, null, 2));

    const propertyData = {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      currency: data.currency,
      location: data.location,
      type: data.type,
      status: data.status,
      
      totalArea: Number(data.totalArea) || 0,
      bedrooms: Number(data.bedrooms) || 1,
      bathrooms: Number(data.bathrooms) || 1,
      area: Number(data.area) || 0,
      
      category: data.category || 'apartment',
      complexName: data.complexName,
      livingArea: Number(data.livingArea) || 0,
      floor: Number(data.floor) || 0,
      buildingFloors: Number(data.buildingFloors) || 0,
      livingRooms: Number(data.livingRooms) || 0,
      balconies: Number(data.balconies) || 0,
      totalRooms: Number(data.totalRooms) || 1,
      renovation: data.renovation,
      installment: Boolean(data.installment),
      parking: Boolean(data.parking),
      swimmingPool: Boolean(data.swimmingPool),
      gym: Boolean(data.gym),
      elevator: Boolean(data.elevator),
      
      coverImage: data.coverImage,
      images: {
        create: Array.isArray(data.images) ? data.images.map((url: string) => ({ url })) : []
      },
      
      ownerId: session.user.id,
      
      specs: {
        create: {
          beds: Number(data.bedrooms) || 0,
          baths: Number(data.bathrooms) || 0,
          area: Number(data.totalArea) || 0
        }
      }
    };

    console.log('Attempting to create property with data:', JSON.stringify(propertyData, null, 2));

    const property = await prisma.property.create({
      data: propertyData,
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        }
      }
    });

    console.log('Property created successfully:', JSON.stringify(property, null, 2));

    const formattedProperty = {
      ...property,
      images: property.images.map(img => img.url)
    };

    return NextResponse.json(formattedProperty);

  } catch (error) {
    console.error('Detailed error:', {
      name: error instanceof Error ? error.name : 'Unknown Error',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      cause: error instanceof Error ? error.cause : undefined
    });

    return NextResponse.json(
      { 
        error: 'Failed to create property',
        details: error instanceof Error ? error.message : 'Unknown error',
        additionalInfo: error instanceof Error ? error.stack : undefined
      },
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

    console.log('Properties from DB:', properties);

    const formattedProperties = properties.map((property: any) => ({
      ...property,
      coverImage: property.coverImage,
      images: property.images.map((img: any) => img.url)
    }));

    return NextResponse.json(formattedProperties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to fetch properties', details: errorMessage },
      { status: 500 }
    );
  }
}