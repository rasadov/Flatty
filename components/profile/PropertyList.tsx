'use client';

import { useEffect, useState, useCallback } from 'react';
import { PropertyCard } from '@/components/PropertyCard';
import { useSession } from 'next-auth/react';
import { Property } from '@/types/property';

interface PropertyListProps {
  userId: string;
}

export function PropertyList({ userId }: PropertyListProps) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  
  // Выделяем функцию fetchProperties для повторного использования
  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/users/${userId}/properties`);
      
      // Проверяем статус ответа
      if (!response.ok) {
        console.warn('Не удалось загрузить объекты недвижимости.');
        setError(`Ошибка загрузки объектов: ${response.status}`);
        return;
      }
      
      // Проверяем тип ответа
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API вернул не JSON формат.');
        setError('Неверный формат ответа от сервера');
        return;
      }
      
      const data = await response.json();
      
      // Проверяем что данные - массив
      if (Array.isArray(data)) {
        console.log(`Загружено ${data.length} объектов для пользователя ${userId}`);
        setProperties(data);
        setError(null);
      } else {
        console.warn('API вернул не массив данных.');
        setError('Некорректный формат данных от сервера');
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(error instanceof Error ? error.message : 'Не удалось загрузить объекты');
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  // Эффект для загрузки и обновления данных
  useEffect(() => {
    // Загружаем данные при монтировании или изменении userId
    fetchProperties();
    
    // Обновляем каждые 5 минут
    const intervalId = setInterval(() => {
      fetchProperties();
    }, 300000);
    
    return () => clearInterval(intervalId);
  }, [fetchProperties, userId]);

  if (isLoading && properties.length === 0) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (properties.length === 0) {
    return <div className="text-center py-8">У пользователя нет объектов недвижимости</div>;
  }

  const isOwnProfile = session?.user?.id === userId;
  const isAdmin = session?.user?.role === 'admin';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <div key={property.id} className="relative">
          <PropertyCard 
            property={property} 
            isUserProperty={isOwnProfile}
            onUpdate={(updatedProperty) => {
              if (!updatedProperty) {
                // Если объект удален, удаляем его из списка
                setProperties(prev => prev.filter(p => p.id !== property.id));
              } else {
                // Если объект обновлен, обновляем его в списке
                setProperties(prev => 
                  prev.map(p => p.id === updatedProperty.id ? updatedProperty : p)
                );
              }
            }}
          />
          {(isOwnProfile || isAdmin) && !property.moderated && !property.rejected && (
            <div className="absolute top-2 left-2">
              <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded">
                Pending Moderation
              </span>
            </div>
          )}
          {(isOwnProfile || isAdmin) && property.rejected && (
            <div className="absolute top-2 left-2">
              <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded flex flex-col">
                <span>Rejected:</span>
                {property.rejectionReason && (
                  <span className="text-xs mt-1">{property.rejectionReason}</span>
                )}
              </span>
            </div>
          )}
        </div>
      ))}
      
      {properties.length === 0 && !isLoading && (
        <div className="col-span-full text-center py-8">
          <p className="text-gray-500">No properties found</p>
        </div>
      )}
    </div>
  );
} 