import { prisma } from '@/lib/prisma';
import { PropertyCard } from '@/components/PropertyCard';
import { SearchResults } from '@/components/search/SearchResults';
import { SimilarProperties } from '@/components/search/SimilarProperties';

interface SearchPageProps {
  searchParams: {
    type?: string;
    priceMin?: string;
    priceMax?: string;
    currency?: string;
    bedroomsMin?: string;
    bedroomsMax?: string;
    bathroomsMin?: string;
    bathroomsMax?: string;
    totalAreaMin?: string;
    totalAreaMax?: string;
    livingAreaMin?: string;
    livingAreaMax?: string;
    floorMin?: string;
    floorMax?: string;
    buildingFloors?: string;
    location?: string;
    parking?: string;
    swimmingPool?: string;
    renovation?: string;
    furnished?: string;
    elevator?: string;
    gym?: string;
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  // Преобразование параметров поиска в условия запроса Prisma
  const where = {
    ...(searchParams.type && { type: searchParams.type }),
    
    // Обработка диапазона цен
    ...((searchParams.priceMin || searchParams.priceMax) && {
      price: {
        ...(searchParams.priceMin && { gte: parseInt(searchParams.priceMin) }),
        ...(searchParams.priceMax && { lte: parseInt(searchParams.priceMax) }),
      },
    }),
    
    ...(searchParams.currency && { currency: searchParams.currency }),
    
    // Обработка диапазона спален
    ...((searchParams.bedroomsMin || searchParams.bedroomsMax) && {
      bedrooms: {
        ...(searchParams.bedroomsMin && { gte: parseInt(searchParams.bedroomsMin) }),
        ...(searchParams.bedroomsMax && { lte: parseInt(searchParams.bedroomsMax) }),
      },
    }),
    
    // Обработка диапазона ванных комнат
    ...((searchParams.bathroomsMin || searchParams.bathroomsMax) && {
      bathrooms: {
        ...(searchParams.bathroomsMin && { gte: parseInt(searchParams.bathroomsMin) }),
        ...(searchParams.bathroomsMax && { lte: parseInt(searchParams.bathroomsMax) }),
      },
    }),
    
    // Обработка диапазона общей площади
    ...((searchParams.totalAreaMin || searchParams.totalAreaMax) && {
      totalArea: {
        ...(searchParams.totalAreaMin && { gte: parseInt(searchParams.totalAreaMin) }),
        ...(searchParams.totalAreaMax && { lte: parseInt(searchParams.totalAreaMax) }),
      },
    }),
    
    // Обработка диапазона жилой площади
    ...((searchParams.livingAreaMin || searchParams.livingAreaMax) && {
      livingArea: {
        ...(searchParams.livingAreaMin && { gte: parseInt(searchParams.livingAreaMin) }),
        ...(searchParams.livingAreaMax && { lte: parseInt(searchParams.livingAreaMax) }),
      },
    }),
    
    // Обработка диапазона этажей
    ...((searchParams.floorMin || searchParams.floorMax) && {
      floor: {
        ...(searchParams.floorMin && { gte: parseInt(searchParams.floorMin) }),
        ...(searchParams.floorMax && { lte: parseInt(searchParams.floorMax) }),
      },
    }),
    
    ...(searchParams.location && { location: searchParams.location }),
    ...(searchParams.parking && { parking: searchParams.parking === 'true' }),
    ...(searchParams.swimmingPool && { swimmingPool: searchParams.swimmingPool === 'true' }),
    ...(searchParams.furnished && { furnished: searchParams.furnished === 'true' }),
    ...(searchParams.elevator && { elevator: searchParams.elevator === 'true' }),
    ...(searchParams.gym && { gym: searchParams.gym === 'true' }),
    ...(searchParams.renovation && { renovation: searchParams.renovation }),
  };

  // Получаем основные результаты поиска
  const properties = await prisma.property.findMany({
    where,
    include: {
      images: true,
      owner: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
  });

  // Получаем похожие объекты по цене (±20% от указанной цены)
  let similarProperties = [];
  if (searchParams.priceMin || searchParams.priceMax) {
    const priceMin = searchParams.priceMin ? parseInt(searchParams.priceMin) : null;
    const priceMax = searchParams.priceMax ? parseInt(searchParams.priceMax) : null;

    similarProperties = await prisma.property.findMany({
      where: {
        NOT: { id: { in: properties.map(p => p.id) } }, // Исключаем уже найденные объекты
        ...(priceMin && { price: { gte: priceMin } }),
        ...(priceMax && { price: { lte: priceMax } }),
        ...(searchParams.currency && { currency: searchParams.currency }),
      },
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      take: 6, // Ограничиваем количество похожих объектов
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-4">
        {/* Заголовок и описание */}
        <div className="text-center mb-4">
          {/* <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
            Search Results
          </h1> */}
          <p className=" text-lg text-center sm:text-left text-gray-600 l ">
            Based on your search criteria, we have found the following properties that match your preferences
          </p>
        </div>

        {/* Основные результаты */}
        <SearchResults properties={properties} searchParams={searchParams} />

        {/* Похожие предложения */}
        {similarProperties.length > 0 && (
          <SimilarProperties properties={similarProperties} />
        )}
      </div>
    </div>
  );
} 