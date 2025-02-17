import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { value } = await request.json();

    const existingRating = await prisma.rating.findUnique({
      where: { 
        propertyId_userId: { 
          propertyId: params.id, 
          userId: session.user.id 
        } 
      }
    });
    if (existingRating) {
      // Обновляем существующий рейтинг
      const rating = await prisma.rating.update({
        where: {
          propertyId_userId: {
            propertyId: params.id,
            userId: session.user.id,
          }
        },
        data: { value }
      });
      return NextResponse.json(rating);
    } else {
      // Создаем новый рейтинг
      const rating = await prisma.rating.create({
        data: {
          value,
          userId: session.user.id,
          propertyId: params.id,
        },
      });
      return NextResponse.json(rating);
    }
  } catch (error) {
    console.error("Error rating property:", error);
    return NextResponse.json(
      { error: "Failed to rate property" },
      { status: 500 }
    );
  }
}
