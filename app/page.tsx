import { Suspense } from 'react';
import Hero from '@/components/sections/Hero';
import BestOffers from '@/components/sections/BestOffers';
import Partners from '@/components/sections/Partners';
import WhyChooseUs from '@/components/sections/WhyChooseUs';
import { FeaturedProperties } from '@/components/sections/FeaturedProperties';
import FeaturedComplexes from '@/components/sections/FeaturedComplexes';
// import Testimonials from '@/components/sections/Testimonials';
// import Newsletter from '@/components/sections/Newsletter';
import { getFeaturedProperties } from '@/lib/properties';
import { prisma } from '@/lib/prisma';
import { Partner } from '@/components/sections/Partners';

// Функция для получения агентов из базы данных
async function getAgents() {
  try {
    // Получаем агентов из базы данных
    const agents = await prisma.user.findMany({
      where: {
        role: "agent_solo", // Только индивидуальные агенты
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        phone: true,
        role: true,
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

    // Преобразовываем данные в формат, ожидаемый компонентом Partners
    const processedAgents: Partner[] = agents.map(agent => {
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
        id: agent.id,
        name: agent.name || '',
        image: imageUrl,
        role: agent.role,
        phone: agent.phone || undefined,
        email: agent.email,
        _count: {
          properties: agent._count.properties
        }
      };
    });

    return processedAgents;
  } catch (error) {
    console.error("Error fetching agents:", error);
    return [];
  }
}

export default async function Home() {
  const properties = await getFeaturedProperties();
  const agents = await getAgents();

  return (
    <main className="pt-2 sm:pt-16">
      <Hero />
      <FeaturedProperties initialProperties={properties} />
      <FeaturedComplexes />
      <BestOffers />
      <Partners partners={agents} />
      <WhyChooseUs />
      
      
      {/* <Testimonials />
      
      <Newsletter /> */}
    </main>
  );
} 