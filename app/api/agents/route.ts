import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const agents = await prisma.user.findMany({
      where: {
        role: 'agent_solo',
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        experience: true,
        properties: {
          where: {
            moderated: true,
            rejected: false,
          },
          select: {
            id: true,
          },
        },
      },
    });

    return NextResponse.json(agents);
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

export const dynamic = 'force-dynamic'; 