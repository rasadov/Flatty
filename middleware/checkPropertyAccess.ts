import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';

export async function checkPropertyAccess(req: Request, userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { listingLimit: true }
  });

  if (!user) {
    return { error: 'User not found', status: 404 };
  }

  // Buyer не может создавать объекты
  if (user.role === 'buyer') {
    return { error: 'Buyers cannot create listings', status: 403 };
  }

  // Проверка лимита для seller
  if (user.role === 'seller') {
    if (user.listingLimit && user.listingLimit.count >= user.listingLimit.maxLimit) {
      return { error: 'You have reached your listing limit', status: 403 };
    }
  }

  // Admin может всё
  if (user.role === 'admin') {
    return { success: true, autoModerate: true };
  }

  // Остальные роли могут создавать объекты без лимита
  return { success: true, autoModerate: false };
} 