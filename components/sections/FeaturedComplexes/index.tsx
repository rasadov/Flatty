'use client';

import { useState, useEffect, useCallback } from 'react';
import { Complex } from '@/types/complex';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

export default function FeaturedComplexes() {
  const [complexes, setComplexes] = useState<Complex[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Используем useCallback для оптимизации и предотвращения бесконечных циклов
  const fetchComplexes = useCallback(async () => {
    // Убираем проверку isLoading, так как мы всегда хотим загрузить данные при первом вызове
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/complexes/public');
      
      // Проверяем статус ответа
      if (!response.ok) {
        console.warn('Не удалось загрузить комплексы.');
        setError(`Ошибка загрузки комплексов: ${response.status}`);
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
      if (!Array.isArray(data)) {
        console.warn('API вернул не массив данных.');
        setError('Некорректный формат данных от сервера');
        return;
      }
      
      // Фильтруем модерированные комплексы для надежности
      const moderatedComplexes = data.filter(
        (complex: Complex) => complex.moderated === true && complex.rejected !== true
      );
      
      console.log('Загружено комплексов:', moderatedComplexes.length);
      setComplexes(moderatedComplexes);
      setError(null); // Сбрасываем ошибку при успешной загрузке
    } catch (error) {
      console.error('Error fetching complexes:', error);
      setError(error instanceof Error ? error.message : 'Не удалось загрузить комплексы');
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить комплексы',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]); // Убрали isLoading из зависимостей

  // Эффект для обновления данных
  useEffect(() => {
    fetchComplexes();
    
    // Обновляем каждые 5 минут
    const intervalId = setInterval(() => {
      fetchComplexes();
    }, 300000);
    
    return () => clearInterval(intervalId);
  }, [fetchComplexes]);

  if (isLoading && complexes.length === 0) {
    return (
      <section className="py-4 bg-[#F9F8FF]">
        <div className="container">
          <div className="sm:flex justify-between sm:text-left text-center mb-8">
            <div>
              <p className="text-black sm:text-left text-center text-2xl mt-2">Discover our newest residential complexes</p>
            </div>
          </div>
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-4 bg-[#F9F8FF]">
        <div className="container">
          <div className="sm:flex justify-between sm:text-left text-center mb-8">
            <div>
              <p className="text-black sm:text-left text-center text-2xl mt-2">Discover our newest residential complexes</p>
            </div>
          </div>
          <div className="text-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-4 bg-[#F9F8FF]">
      <div className="container">
        <div className="sm:flex justify-between sm:text-left text-center  mb-8">
          <div>
            {/* <h2 className="text-2xl font-bold">Featured Complexes</h2> */}
            <p className="text-black sm:text-left text-center  text-2xl mt-2">Discover our newest residential complexes</p>
          </div>
          <Link href="/complexes">
            <Button variant="outline" className='mt-2 sm:mt-0 w-[100px]'>View All</Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complexes.slice(0, 6).map(complex => (
            <Link key={complex.id} href={`/complexes/${complex.id}`}>
              <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative h-48">
                  {complex.coverImage ? (
                    <Image
                      src={complex.coverImage}
                      alt={complex.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-semibold mb-2">{complex.name}</h3>
                  <div className="space-y-1 text-sm text-gray-500">
                    <p>{complex.totalObjects} objects • {complex.floors} floors</p>
                    <p>Built in {complex.yearBuilt}</p>
                    <div className="flex gap-2 mt-2">
                      {complex.parking && <span className="text-xs bg-gray-100 px-2 py-1 rounded">Parking</span>}
                      {complex.swimmingPool && <span className="text-xs bg-gray-100 px-2 py-1 rounded">Pool</span>}
                      {complex.elevator && <span className="text-xs bg-gray-100 px-2 py-1 rounded">Elevator</span>}
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
} 