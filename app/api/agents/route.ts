import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const sort = searchParams.get('sort');

    console.log('Starting to fetch agents...');

    // Сначала получим всех пользователей с ролью agent_solo
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
        countryCode: true,
        description: true,
        experience: true,
        licenseNumber: true,
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
      take: limit,
      orderBy: sort === 'listings' ? {
        properties: {
          _count: 'desc'
        }
      } : {
        experience: 'desc'
      },
    });

    console.log('Raw agents data:', JSON.stringify(agents, null, 2));

    // Преобразуем данные в нужный формат
    const formattedAgents = agents.map(agent => ({
      id: agent.id,
      name: agent.name || '',
      image: agent.image,
      email: agent.email,
      phone: agent.phone,
      countryCode: agent.countryCode,
      description: agent.description,
      experience: agent.experience || 0,
      licenseNumber: agent.licenseNumber || 'N/A',
      listings: agent.properties || [],
      rating: 5, // Временно установим фиксированный рейтинг
      _count: {
        reviews: 0 // Временно установим фиксированное количество отзывов
      }
    }));

    console.log('Formatted agents:', JSON.stringify(formattedAgents, null, 2));

    return NextResponse.json(formattedAgents);
  } catch (error) {
    console.error('Detailed error in /api/agents:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch agents',
        details: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; 