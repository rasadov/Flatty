import { prisma } from '@/lib/prisma';
import MapView from '@/components/map/MapView';
import PropertyList from '@/components/map/PropertyList';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export default async function MapPage() {
  const session = await getServerSession(authOptions);

  // Получаем объекты с фильтрацией и координатами
  const properties = await prisma.property.findMany({
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

  console.log('Fetched properties with coordinates:', properties.map(p => ({
    id: p.id,
    lat: p.latitude,
    lng: p.longitude
  })));

  return (
    <div className="h-screen flex">
      {/* Левая панель со списком */}
      <div className="w-1/3 h-full overflow-y-auto border-r bg-white hidden sm:block">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Properties</h1>
          <PropertyList properties={properties} />
        </div>
      </div>

      {/* Правая панель с картой */}
      <div className="w-full sm:w-2/3 h-full relative">
        <MapView properties={properties} />
      </div>
    </div>
  );
} 