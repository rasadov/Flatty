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
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    console.log('Resubmitting property:', params.id, 'with data:', data);

    // Проверяем, что пользователь является владельцем
    const existingProperty = await prisma.property.findUnique({
      where: { id: params.id },
      include: { images: true }
    });

    if (!existingProperty) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    if (existingProperty.ownerId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Подготавливаем данные для обновления
    const updateData = {
      title: data.title,
      description: data.description,
      price: Number(data.price),
      currency: data.currency,
      status: data.status,
      type: data.type,
      location: data.location,
      bedrooms: Number(data.bedrooms),
      bathrooms: Number(data.bathrooms),
      totalArea: Number(data.totalArea),
      livingArea: Number(data.livingArea || 0),
      floor: Number(data.floor || 0),
      buildingFloors: Number(data.buildingFloors || 0),
      livingRooms: Number(data.livingRooms || 0),
      balconies: Number(data.balconies || 0),
      totalRooms: Number(data.totalRooms || 0),
      parking: Boolean(data.parking),
      elevator: Boolean(data.elevator),
      furnished: Boolean(data.furnished),
      swimmingPool: Boolean(data.swimmingPool),
      gym: Boolean(data.gym),
      installment: Boolean(data.installment),
      renovation: data.renovation,
      latitude: Number(data.latitude),
      longitude: Number(data.longitude),
      // Сбрасываем статусы модерации
      moderated: false,
      rejected: false,
      rejectionReason: null,
      propertyRating: null
    };

    // Обновляем свойство
    const updatedProperty = await prisma.property.update({
      where: { id: params.id },
      data: updateData,
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

    console.log('Property resubmitted successfully:', updatedProperty.id);
    return NextResponse.json(updatedProperty);
  } catch (error) {
    console.error('Error resubmitting property:', error);
    return NextResponse.json(
      { error: 'Failed to resubmit property', details: (error as Error).message },
      { status: 500 }
    );
  }
} 