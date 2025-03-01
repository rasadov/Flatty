'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Property } from '@/types/property';
import { useToast } from '@/components/ui/use-toast';

interface PropertiesContextType {
  properties: Property[];
  refreshProperties: () => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const PropertiesContext = createContext<PropertiesContextType | null>(null);

export function PropertiesProvider({ children }: { children: ReactNode }) {
  const [properties, setProperties] = useState<Property[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { toast } = useToast();

  const fetchProperties = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Сначала пробуем загрузить пользовательские объекты (требует авторизации)
      let response = await fetch('/api/properties?user=true');
      
      // Если неавторизованы (401), используем публичный API
      if (response.status === 401) {
        console.log('Пользователь не авторизован, загружаем публичные объекты');
        response = await fetch('/api/properties/public');
      }
      
      // Проверяем статус ответа
      if (!response.ok) {
        console.warn('Не удалось загрузить объекты недвижимости.');
        setError(`Ошибка загрузки объектов: ${response.status}`);
        setProperties([]);
        return;
      }
      
      // Проверяем тип ответа
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        console.warn('API вернул не JSON формат.');
        setError('Неверный формат ответа от сервера');
        setProperties([]);
        return;
      }
      
      const data = await response.json();
      
      // Проверяем что данные - массив
      if (Array.isArray(data)) {
        console.log('Загружено объектов недвижимости:', data.length);
        setProperties(data);
        setError(null);
      } else {
        console.warn('API вернул не массив данных.');
        setError('Некорректный формат данных от сервера');
        setProperties([]);
      }
    } catch (error) {
      console.error('Error fetching properties:', error);
      setError(error instanceof Error ? error.message : 'Не удалось загрузить объекты');
      toast({
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось загрузить объекты',
        variant: 'destructive',
      });
      setProperties([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    // Загружаем данные при инициализации
    fetchProperties();
    
    // Обновляем каждые 5 минут
    const intervalId = setInterval(() => {
      fetchProperties();
    }, 300000);
    
    return () => clearInterval(intervalId);
  }, [fetchProperties]);

  return (
    <PropertiesContext.Provider 
      value={{ 
        properties,
        refreshProperties: fetchProperties,
        isLoading,
        error
      }}
    >
      {children}
    </PropertiesContext.Provider>
  );
}

export function useProperties() {
  const context = useContext(PropertiesContext);
  if (!context) {
    throw new Error('useProperties must be used within a PropertiesProvider');
  }
  return context;
} 