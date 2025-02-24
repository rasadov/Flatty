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
    const session = await getServerSession(authOptions);
    
    const properties = await prisma.property.findMany({
      where: {
        OR: [
          // Показываем все одобренные объекты
          { 
            moderated: true,
            rejected: false 
          },
          // Показываем объекты на модерации только их владельцу
          ...(session?.user?.id ? [{
            ownerId: session.user.id,
          }] : [])
        ]
      },
      include: {
        images: true,
        ratings: true,
        owner: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const formattedProperties = properties.map((property: any) => ({
      ...property,
      coverImage: property.coverImage.url,
      images: property.images.map((img: any) => img.url)
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

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Updating property with data:', data);

    // Проверяем, существует ли объект
    const existingProperty = await prisma.property.findUnique({
      where: { id: params.id },
    });

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (existingProperty.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Обновляем свойство напрямую, без вложенных объектов
    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        price: Number(data.price),
        currency: data.currency,
        location: data.location,
        type: data.type,
        status: data.status,
        category: data.category,
        
        // Основные характеристики
        totalArea: Number(data.totalArea),
        bedrooms: Number(data.bedrooms),
        bathrooms: Number(data.bathrooms),
        livingArea: Number(data.livingArea),
        floor: Number(data.floor),
        buildingFloors: Number(data.buildingFloors),
        livingRooms: Number(data.livingRooms),
        balconies: Number(data.balconies),
        totalRooms: Number(data.totalRooms),

        // Дополнительные характеристики
        parking: Boolean(data.parking),
        elevator: Boolean(data.elevator),
        swimmingPool: Boolean(data.swimmingPool),
        gym: Boolean(data.gym),
        furnished: Boolean(data.furnished),
        installment: Boolean(data.installment),

        renovation: data.renovation || null,
        complexName: data.complexName || null,

        // Изображения оставляем как есть
        coverImage: data.coverImage,
        // images обрабатываем отдельно, если нужно
      },
      include: {
        owner: true,
        images: true,
      }
    });

    console.log('Property updated successfully:', updatedProperty);

    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error updating property:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to update property', details: errorMessage },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 });
    }

    const property = await prisma.property.findUnique({
      where: { id: params.id },
      select: { ownerId: true }
    });

    if (!property) {
      return new Response('Property not found', { status: 404 });
    }

    if (property.ownerId !== session.user.id) {
      return new Response('Unauthorized', { status: 403 });
    }

    // Удаляем объект
    await prisma.property.delete({
      where: { id: params.id }
    });

    // Если пользователь seller, уменьшаем счетчик
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    });

    if (user?.role === 'seller') {
      await prisma.userListingLimit.update({
        where: { userId: session.user.id },
        data: { count: { decrement: 1 } }
      });
    }

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting property:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    console.log('PATCH - Received data:', JSON.stringify(data, null, 2));

    // Проверяем, существует ли объект и принадлежит ли он пользователю
    const existingProperty = await prisma.property.findUnique({
      where: { id: params.id },
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
        where: { propertyId: params.id }
      });
    }

    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
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