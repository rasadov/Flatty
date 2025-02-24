import { NextResponse } from 'next/server';
import { hash } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const data = await req.json();
    const { 
      email, 
      password, 
      name, 
      role, 
      phone,
      countryCode,
      description,
      // Другие поля в зависимости от роли
      licenseNumber,
      experience,
      companyName,
      regions,
      establishedYear
    } = data;

    const hashedPassword = await hash(password, 12);
    
    // Создаем пользователя со всеми полями
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role,
        phone,
        countryCode,
        description,
        // Добавляем условные поля в зависимости от роли
        ...(role === 'agent_solo' && {
          licenseNumber,
          experience: experience ? parseInt(experience) : null,
        }),
        ...(role === 'agent_company' && {
          companyName,
        }),
        ...(role === 'builder' && {
          companyName,
          regions,
          establishedYear: establishedYear ? parseInt(establishedYear) : null,
        }),
        // Создаем лимит для seller
        ...(role === 'seller' && {
          listingLimit: {
            create: {
              maxLimit: 3,
              count: 0
            }
          }
        })
      }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        countryCode: user.countryCode,
        description: user.description
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
} 