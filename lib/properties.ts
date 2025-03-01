import { prisma } from '@/lib/prisma';

export async function getFeaturedProperties() {
  return await prisma.property.findMany({
    where: {
      moderated: true,
      rejected: false,
    },
    include: {
      images: true,
      owner: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
} 