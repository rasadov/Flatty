import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import ComplexDetails from '@/components/ComplexDetails';
import { RatingBadge } from "@/components/ui/rating-badge";

interface ComplexPageProps {
  params: {
    id: string;
  };
}

export default async function ComplexPage({ params }: ComplexPageProps) {
  try {
    console.log('Fetching complex with ID:', params.id);

    const complex = await prisma.complex.findUnique({
      where: { id: params.id },
      include: {
        images: true,
        properties: {
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
        },
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          },
        },
      },
    });

    if (!complex) {
      return notFound();
    }

    return (
      <div className="container py-8">
        <div className="relative">
          {complex.moderated && !complex.rejected && complex.propertyRating && (
            <div className="absolute top-4 left-4 z-10">
              <RatingBadge rating={complex.propertyRating} className="text-sm" />
            </div>
          )}
          <ComplexDetails complex={complex} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching complex:', error);
    throw error;
  }
} 