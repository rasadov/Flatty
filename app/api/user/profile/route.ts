import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validations/user';

// GET метод для получения данных профиля
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return new Response('Unauthorized', { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        phone: true,
        countryCode: true,
        description: true,
        licenseNumber: true,
        experience: true,
        companyName: true,
        establishedYear: true,
        regions: true,
      }
    });

    if (!user) {
      return new Response('User not found', { status: 404 });
    }

    return Response.json(user);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}

// PUT метод для обновления профиля
export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    try {
      const validatedData = updateProfileSchema.parse(body);
      
      const updatedUser = await prisma.user.update({
        where: { id: session.user.id }, // Используем id вместо email
        data: validatedData,
        select: {
          id: true,
          name: true,
          email: true,
          image: true,
          role: true,
          phone: true,
          countryCode: true,
          description: true,
        },
      });

      return NextResponse.json(updatedUser);
    } catch (validationError) {
      console.error('Validation error:', validationError);
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 