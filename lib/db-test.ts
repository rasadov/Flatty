import { prisma } from './prisma';

async function testConnection() {
  try {
    await prisma.$connect();
    console.log('Successfully connected to database');
    
    // Проверяем, что можем выполнять запросы
    const count = await prisma.user.count();
    console.log('Current user count:', count);
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

testConnection(); 