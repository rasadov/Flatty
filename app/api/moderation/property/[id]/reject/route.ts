import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { reason } = await request.json();

    const property = await prisma.property.update({
      where: { id: params.id },
      data: {
        rejected: true,
        rejectionReason: reason,
      },
    });

    return NextResponse.json(property);
  } catch (error) {
    console.error('Error rejecting property:', error);
    return NextResponse.json(
      { error: 'Failed to reject property' },
      { status: 500 }
    );
  }
} 