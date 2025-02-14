import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/auth';
import { prisma } from '@/lib/prisma';

// DELETE /api/user/saved-searches/[id]
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Проверяем, принадлежит ли поиск пользователю
    const search = await prisma.savedSearch.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!search) {
      return NextResponse.json({ error: 'Search not found' }, { status: 404 });
    }

    await prisma.savedSearch.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete saved search' },
      { status: 500 }
    );
  }
} 