import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';
import { checkPropertyAccess } from '@/middleware/checkPropertyAccess';

const ROLE_LIMITS = {
  seller: 3,
  agent_solo: 30,
  agent_company: 100,
  builder: 1000,
  admin: Infinity
};

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { address, documents, ...propertyData } = data;

    const property = await prisma.property.create({
      data: {
        ...propertyData,
        ownerId: session.user.id,
        images: {
          create: propertyData.images
        },
        documents: {
          create: documents?.map((doc: { url: string; type: string }) => ({
            url: doc.url,
            type: doc.type
          })) || []
        },
        street: address?.street,
        city: address?.city,
        district: address?.district,
        region: address?.region,
        postalCode: address?.postalCode,
        buildingNumber: address?.buildingNumber,
        block: address?.block,
      },
      include: {
        images: true,
        documents: true,
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

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error creating property:', error);
    return NextResponse.json(
      { error: 'Failed to create property' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    console.log('PATCH - Received data:', JSON.stringify(data, null, 2));

    // Проверяем, существует ли объект и принадлежит ли он пользователю
    const existingProperty = await prisma.property.findUnique({
      where: { id: data.id },
      include: { images: true }
    });

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (existingProperty.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Удаляем старые изображения, если они были изменены
    if (data.images) {
      await prisma.image.deleteMany({
        where: { propertyId: data.id }
      });
    }

    const updatedProperty = await prisma.property.update({
      where: { id: data.id },
      data: {
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
        images: data.images ? {
          create: data.images.map((url: string) => ({ url }))
        } : undefined,
      },
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

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('PATCH Error:', error);
    return NextResponse.json(
      { error: 'Failed to update property' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    // Если запрашиваются свойства пользователя, проверяем авторизацию
    const { searchParams } = new URL(request.url);
    const isUserProperties = searchParams.get('user') === 'true';

    if (isUserProperties) {
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const properties = await prisma.property.findMany({
        where: {
          ownerId: session.user.id
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

      return NextResponse.json(properties);
    }

    // Для публичного списка свойств
    const properties = await prisma.property.findMany({
      where: {
        moderated: true,
        rejected: false,
      },
      include: {
        images: true,
        documents: true,
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

    return NextResponse.json(properties);
  } catch (error) {
    console.error('Error fetching properties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch properties' },
      { status: 500 }
    );
  }
}