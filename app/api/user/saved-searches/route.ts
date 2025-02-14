import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const searchCriteriaSchema = z.object({
  name: z.string(),
  criteria: z.object({
    propertyType: z.string().optional(),
    location: z.string().optional(),
    price: z.number().optional(),
    beds: z.number().optional(),
    baths: z.number().optional(),
    area: z.number().optional(),
  }),
});

// GET /api/user/saved-searches
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session); // Для отладки
    
    if (!session?.user?.id) {
      console.log('No user ID in session'); // Для отладки
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searches = await prisma.savedSearch.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(searches);
  } catch (error) {
    console.error('Error fetching saved searches:', error);
    return NextResponse.json(
      { error: 'Failed to fetch saved searches' },
      { status: 500 }
    );
  }
}

// POST /api/user/saved-searches
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    
    // Валидация входящих данных
    const validatedData = searchCriteriaSchema.parse(body);

    const savedSearch = await prisma.savedSearch.create({
      data: {
        name: validatedData.name,
        criteria: validatedData.criteria,
        userId: session.user.id,
      },
    });

    return NextResponse.json(savedSearch);
  } catch (error) {
    console.error('Error saving search:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data format', details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to save search' },
      { status: 500 }
    );
  }
} 