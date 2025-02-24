import { prisma } from '@/lib/prisma';
import PropertyDetails from '@/components/PropertyDetails';
import { notFound } from 'next/navigation';
import { RatingBadge } from "@/components/ui/rating-badge";

interface PropertyPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  try {
    console.log('Fetching property with ID:', params.id);

    const property = await prisma.property.findUnique({
      where: { 
        id: params.id 
      },
      include: {
        images: true,
        owner: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            image: true,
          }
        },
        ratings: true,
        favorites: true,
      },
    });

    console.log('Fetched property data:', JSON.stringify(property, null, 2));

    if (!property) {
      console.log('Property not found');
      return notFound();
    }

    // Подготавливаем данные для компонента с дефолтным рейтингом A
    const propertyWithRating = {
      ...property,
      propertyRating: property.propertyRating || 'A',
    };

    console.log('Prepared property data:', JSON.stringify(propertyWithRating, null, 2));

    return (
      <div className="container py-2">
        <div className="relative">
          {property.moderated && !property.rejected && property.propertyRating && (
            <div className="sm:ml-4 z-10">
              <RatingBadge rating={property.propertyRating} className="text-sm" />
            </div>
          )}
          <PropertyDetails property={propertyWithRating} />
        </div>
      </div>
    );
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
} 