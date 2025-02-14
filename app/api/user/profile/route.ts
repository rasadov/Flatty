import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { prisma } from '@/lib/prisma';
import { updateProfileSchema } from '@/lib/validations/user';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    
    try {
      const validatedData = updateProfileSchema.parse(body);
      
      const updatedUser = await prisma.user.update({
        where: { email: session.user.email },
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          description: validatedData.description,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          description: true,
          role: true,
          image: true,
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