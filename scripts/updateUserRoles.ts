import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // 1. Обновляем роли пользователей
    await prisma.user.updateMany({
      where: {
        role: 'agent'
      },
      data: {
        role: 'agent_solo'
      }
    });

    // 2. Создаем лимиты для seller'ов
    const sellers = await prisma.user.findMany({
      where: {
        role: 'seller'
      }
    });

    for (const seller of sellers) {
      // Подсчитываем количество существующих объектов
      const propertyCount = await prisma.property.count({
        where: {
          ownerId: seller.id
        }
      });

      // Создаем запись о лимите
      await prisma.userListingLimit.create({
        data: {
          userId: seller.id,
          count: propertyCount,
          maxLimit: 3
        }
      });
    }

    console.log('Successfully updated user roles and created listing limits');
  } catch (error) {
    console.error('Error updating data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main(); 