import { prisma } from '@/lib/prisma';
import PropertyDetails from '@/components/PropertyDetails';
import { notFound } from 'next/navigation';

interface PropertyPageProps {
  params: {
    id: string;
  };
}

export default async function PropertyPage({ params }: PropertyPageProps) {
  try {
    const property = await prisma.property.findUnique({
      where: {
        id: params.id,
      },
      include: {
        images: true,
        ratings: true,
        owner: true,
        likedBy: true,
      },
    });

    if (!property) {
      notFound();
    }

    // Форматируем данные для компонента
    const formattedProperty = {
      id: property.id,
      title: property.title,
      description: property.description,
      price: property.price,
      location: property.location,
      type: property.type,
      status: property.status,
      specs: {
        beds: property.bedrooms,
        baths: property.bathrooms,
        area: property.area,
      },
      coverImage: property.coverImage,
      images: property.images.map((img: any) => img.url),
      ratings: property.ratings,
      owner: property.owner,
      createdAt: property.createdAt.toISOString(),
      totalRatings: property.ratings.length,
      averageRating: property.ratings.length > 0
        ? property.ratings.reduce((acc: number, r: any) => acc + r.value, 0) / property.ratings.length
        : 0,
     likedBy: property.likedBy || [],
    };

    return <PropertyDetails property={formattedProperty} />;
  } catch (error) {
    console.error('Error fetching property:', error);
    throw error;
  }
} 