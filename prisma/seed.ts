import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Создаем тестового пользователя с хешированным паролем
  const hashedPassword = await hash('test123', 10);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      role: 'USER',
      password: hashedPassword,
    },
  });

  // Создаем несколько тестовых объектов недвижимости
  const properties = await Promise.all([
    prisma.property.create({
      data: {
        title: 'Luxury Villa with Sea View',
        description: 'Beautiful villa with amazing sea views and modern amenities',
        price: 850000,
        location: 'Limassol, Cyprus',
        propertyType: 'villa',
        dealType: 'sale',
        coverImage: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9',
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9'
        ],
        specs: {
          beds: 4,
          baths: 3,
          area: 250,
          plotSize: 500
        },
        features: ['pool', 'garden', 'sea-view', 'security', 'air-conditioning'],
        yearBuilt: 2022,
        furnished: true,
        parking: true,
        petsAllowed: true,
        latitude: 34.7071301,
        longitude: 33.0226174,
        status: 'AVAILABLE',
        ownerId: user.id,
      },
    }),
    prisma.property.create({
      data: {
        title: 'Modern Apartment in City Center',
        description: 'Stylish apartment in the heart of the city',
        price: 350000,
        location: 'Nicosia, Cyprus',
        propertyType: 'apartment',
        dealType: 'sale',
        coverImage: 'https://images.unsplash.com/photo-1600607687644-53ca51a0465f',
        images: [
          'https://images.unsplash.com/photo-1600607687644-53ca51a0465f',
          'https://images.unsplash.com/photo-1600607687644-53ca51a0465f',
          'https://images.unsplash.com/photo-1600607687644-53ca51a0465f'
        ],
        specs: {
          beds: 2,
          baths: 1,
          area: 85,
        },
        features: ['elevator', 'security', 'air-conditioning'],
        yearBuilt: 2020,
        furnished: true,
        parking: true,
        petsAllowed: false,
        latitude: 35.1855659,
        longitude: 33.3822764,
        status: 'AVAILABLE',
        ownerId: user.id,
      },
    }),
    prisma.property.create({
      data: {
        title: 'Beachfront Penthouse',
        description: 'Luxurious penthouse with private roof garden',
        price: 1200000,
        location: 'Paphos, Cyprus',
        propertyType: 'penthouse',
        dealType: 'sale',
        coverImage: 'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
        images: [
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d',
          'https://images.unsplash.com/photo-1600607687920-4e2a09cf159d'
        ],
        specs: {
          beds: 3,
          baths: 2,
          area: 180,
        },
        features: ['sea-view', 'roof-garden', 'pool', 'security', 'air-conditioning'],
        yearBuilt: 2023,
        furnished: true,
        parking: true,
        petsAllowed: true,
        latitude: 34.7720133,
        longitude: 32.4297369,
        status: 'AVAILABLE',
        ownerId: user.id,
      },
    }),
  ]);

  // Создаем тестовый сохраненный поиск
  const savedSearch = await prisma.savedSearch.create({
    data: {
      name: 'Luxury Villas in Limassol',
      userId: user.id,
      criteria: {
        location: 'Limassol',
        propertyType: 'villa',
        dealType: 'sale',
        priceRange: { min: 500000, max: 1500000 },
        bedrooms: 4,
        features: ['pool', 'garden', 'sea-view'],
        furnished: true,
        parking: true
      },
    },
  });

  // Добавляем первое свойство в избранное пользователя
  await prisma.user.update({
    where: { id: user.id },
    data: {
      favorites: {
        connect: { id: properties[0].id }
      }
    }
  });

  console.log({
    user,
    properties,
    savedSearch,
    message: 'Seed data created successfully'
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 