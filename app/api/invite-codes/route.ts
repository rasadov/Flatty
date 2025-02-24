import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inviteCodes = await prisma.inviteCode.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(inviteCodes);
  } catch (error) {
    console.error('Error fetching invite codes:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (session?.user?.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { role, expiresIn } = await req.json();
    
    // Генерируем уникальный код
    const code = crypto.randomBytes(6).toString('hex').toUpperCase();
    
    // Вычисляем дату истечения, если указана
    const expiresAt = expiresIn ? new Date(Date.now() + expiresIn) : null;

    const inviteCode = await prisma.inviteCode.create({
      data: {
        code,
        role,
        expiresAt
      }
    });

    return NextResponse.json(inviteCode);
  } catch (error) {
    console.error('Error creating invite code:', error);
    return NextResponse.json(
      { error: 'Failed to create invite code' },
      { status: 500 }
    );
  }
} 