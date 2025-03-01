import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Добавляем переменную для кэширования последних результатов
let cachedAgents: any = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут в миллисекундах

export async function GET() {
  try {
    const currentTime = Date.now();
    
    // Используем кэш, если он существует и не устарел
    if (cachedAgents && (currentTime - cacheTimestamp < CACHE_TTL)) {
      console.log('Возвращаем кэшированных агентов из /api/agents');
      return NextResponse.json(cachedAgents, { 
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // 5 минут кэширования
          'X-Cache': 'HIT'
        }
      });
    }

    console.log('Загружаем агентов из базы данных через /api/agents');
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
        role: true,
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

    // Обновляем кэш
    cachedAgents = agents;
    cacheTimestamp = currentTime;

    return NextResponse.json(agents, { 
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5 минут кэширования
        'X-Cache': 'MISS'
      }
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json({ error: 'Failed to fetch agents' }, { status: 500 });
  }
}

// Изменяем с force-dynamic на default для включения кэширования
export const dynamic = 'force-dynamic'; 