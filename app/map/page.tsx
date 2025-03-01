import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import MapPageClient from '@/components/map/MapPageClient';
import { Property } from '@/types/property';

export default async function MapPage() {
  const session = await getServerSession(authOptions);

  // Получаем объекты с фильтрацией и координатами
  let properties = await prisma.property.findMany({
    where: {
      OR: [
        // Показываем одобренные объекты всем
        { 
          moderated: true,
          rejected: false,
          // Убедимся что есть координаты
          AND: {
            latitude: { not: null },
            longitude: { not: null }
          }
        },
        // Показываем объекты на модерации их владельцу
        ...(session?.user?.id ? [{
          ownerId: session.user.id,
          AND: {
            latitude: { not: null },
            longitude: { not: null }
          }
        }] : [])
      ]
    },
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

  // Преобразуем данные для передачи клиентскому компоненту
  properties = JSON.parse(JSON.stringify(properties));

  return <MapPageClient properties={properties} />;
} 