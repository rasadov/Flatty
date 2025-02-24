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

    console.log('Approving complex:', params.id);

    const complex = await prisma.complex.update({
      where: { id: params.id },
      data: { moderated: true },
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

    console.log('Complex approved successfully');
    return NextResponse.json(complex);
  } catch (error) {
    console.error('Error approving complex:', error);
    return NextResponse.json(
      { error: 'Failed to approve complex' },
      { status: 500 }
    );
  }
} 