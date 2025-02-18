import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { propertySchema } from '@/lib/validations/property';

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

    const propertyData = {
      title: data.title,
      description: data.description,
      price: data.price,
      currency: data.currency,
      location: data.location,
      type: data.type,
      status: data.status.replace('for-', ''),
      
      totalArea: data.totalArea || 0,
      bedrooms: data.bedrooms || 1,
      bathrooms: data.bathrooms || 1,
      area: data.area || 0,
      
      category: data.category || 'apartment',
      complexName: data.complexName,
      livingArea: data.livingArea,
      floor: data.floor,
      apartmentStories: data.apartmentStories,
      buildingFloors: data.buildingFloors,
      livingRooms: data.livingRooms,
      balconies: data.balconies || 0,
      totalRooms: data.totalRooms || 1,
      renovation: data.renovation,
      installment: data.installment || false,
      parking: data.parking || false,
      swimmingPool: data.swimmingPool || false,
      gym: data.gym || false,
      elevator: data.elevator || false,
      
      coverImage: data.coverImage,
      images: {
        create: data.images.map((url: string) => ({ url }))
      },
      owner: {
        connect: {
          id: session.user.id
        }
      }
    };

    const property = await prisma.property.create({
      data: propertyData,
      include: {
        images: true,
        ratings: true,
        owner: true
      }
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to create property', details: errorMessage },
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
      coverImage: property.coverImage.url,
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    // Проверяем, принадлежит ли объект текущему пользователю
    const existingProperty = await prisma.property.findUnique({
      where: { id: params.id },
      include: { owner: true }
    });

    if (!existingProperty || existingProperty.owner.id !== session.user.id) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
        currency: data.currency,
        location: data.location,
        type: data.type,
        status: data.status,
        totalArea: data.totalArea,
        livingArea: data.livingArea,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        floor: data.floor,
        buildingFloors: data.buildingFloors,
        parking: data.parking,
        elevator: data.elevator,
        updatedAt: new Date(),
      },
      include: {
        owner: true,
        images: true,
      }
    });

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}