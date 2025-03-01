import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

let cachedAgents: any = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 минут в миллисекундах

export async function GET(request: Request) {
  try {
    const currentTime = Date.now();
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '100');
    const sort = searchParams.get('sort') || '';
    
    if (cachedAgents && (currentTime - cacheTimestamp < CACHE_TTL)) {
      console.log('Возвращаем кэшированных агентов');
      return NextResponse.json(cachedAgents, { 
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=300', // 5 минут кэширования
          'X-Cache': 'HIT'
        }
      });
    }

    console.log('Загружаем агентов из базы данных');
    const agents = await prisma.user.findMany({
      where: {
        role: "agent_solo", // Отображать только агентов-одиночек 
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        properties: {
          where: {
            status: "active",
          },
          select: {
            id: true,
          },
        },
        _count: {
          select: {
            properties: {
              where: {
                status: "active",
              },
            },
          },
        },
      },
      take: 5,
    });

    // Преобразуем данные агентов с правильной обработкой поля image
    const processedAgents = agents.map(agent => {
      // Обработка URL изображения
      let imageUrl = '/images/default-avatar.png'; // Путь по умолчанию
      
      if (agent.image) {
        // Если изображение есть, но не начинается с / или http, добавляем /
        if (!agent.image.startsWith('/') && !agent.image.startsWith('http')) {
          imageUrl = `/${agent.image}`;
        } else {
          imageUrl = agent.image;
        }
      }
      
      return {
        ...agent,
        image: imageUrl,
      };
    });

    cachedAgents = processedAgents;
    cacheTimestamp = currentTime;

    return NextResponse.json(processedAgents, { 
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5 минут кэширования
        'X-Cache': 'MISS'
      }
    });
  } catch (error) {
    console.error("Error fetching agents:", error);
    return NextResponse.json({ error: "Failed to fetch agents" }, { status: 500 });
  }
} 