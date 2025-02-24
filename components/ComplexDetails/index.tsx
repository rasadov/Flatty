'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { 
  ArrowLeft, ChevronLeft, ChevronRight, MapPin, Phone, 
  Building2, Car, Waves, Dumbbell, CreditCard 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PropertyCard } from '@/components/PropertyCard';
import { cn } from '@/lib/utils';
import Section from '../sections/Section';
import { Complex } from '@/types/complex';

interface ComplexDetailsProps {
  complex: Complex & {
    owner: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      image: string | null;
    };
    properties: any[];
  };
}

const ComplexDetails = ({ complex }: ComplexDetailsProps) => {
  const router = useRouter();
  const [currentImage, setCurrentImage] = useState(0);

  const allImages = useMemo(() => {
    const images: string[] = [];
    
    if (complex.coverImage) {
      images.push(complex.coverImage);
    }

    complex.images.forEach(img => {
      const imageUrl = typeof img === 'string' ? img : img.url;
      if (imageUrl && !images.includes(imageUrl)) {
        images.push(imageUrl);
      }
    });

    return images;
  }, [complex.coverImage, complex.images]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Section>
        <div className="container mx-auto px-4">
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Галерея изображений */}
            <div className="space-y-4">
              <div className="relative aspect-[16/9] rounded-xl overflow-hidden">
                {allImages.length > 0 && (
                  <Image
                    src={allImages[currentImage]}
                    alt={complex.name}
                    fill
                    className="object-cover"
                    priority
                  />
                )}
                
                {allImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImage((prev) => (prev - 1 + allImages.length) % allImages.length)}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={() => setCurrentImage((prev) => (prev + 1) % allImages.length)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white transition-colors"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Миниатюры */}
              {allImages.length > 1 && (
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-2">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImage(index)}
                        className={cn(
                          "relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden",
                          currentImage === index && "ring-2 ring-primary"
                        )}
                      >
                        <Image
                          src={image}
                          alt={`${complex.name} - image ${index + 1}`}
                          fill
                          className="object-cover hover:opacity-75 transition-opacity"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Информация о комплексе */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {complex.name}
                </h1>
                <p className="text-lg text-gray-600 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {complex.location}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{complex.floors}</p>
                    <p className="text-sm text-gray-500">Floors</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-gray-400" />
                  <div>
                    <p className="font-medium">{complex.totalObjects}</p>
                    <p className="text-sm text-gray-500">Total Objects</p>
                  </div>
                </div>
              </div>

              {/* Удобства */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Amenities</h3>
                <div className="grid grid-cols-2 gap-4">
                  {complex.parking && (
                    <div className="flex items-center gap-2">
                      <Car className="w-5 h-5 text-gray-400" />
                      <span>Parking</span>
                    </div>
                  )}
                  {complex.swimmingPool && (
                    <div className="flex items-center gap-2">
                      <Waves className="w-5 h-5 text-gray-400" />
                      <span>Swimming Pool</span>
                    </div>
                  )}
                  {complex.gym && (
                    <div className="flex items-center gap-2">
                      <Dumbbell className="w-5 h-5 text-gray-400" />
                      <span>Gym</span>
                    </div>
                  )}
                  {complex.installment && (
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-gray-400" />
                      <span>Installment Available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Информация о застройщике */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                <h3 className="text-lg font-semibold">Developer Information</h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Link 
                      href={`/users/${complex.owner.id}`} 
                      className="flex items-center gap-3 hover:bg-gray-100 p-2 rounded-lg transition-colors"
                    >
                      <div className="relative w-12 h-12 rounded-full overflow-hidden">
                        <Image
                          src={complex.owner.image || '/images/default-avatar.png'}
                          alt={complex.owner.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium">{complex.owner.name}</p>
                        <p className="text-sm text-gray-500">{complex.owner.email}</p>
                        {complex.owner.phone && (
                          <p className="text-sm text-gray-500">{complex.owner.phone}</p>
                        )}
                      </div>
                    </Link>
                    <Button>
                      <Phone className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Объекты в комплексе */}
          {complex.properties.length > 0 && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold mb-6">Available Properties</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {complex.properties.map((property) => (
                  <PropertyCard
                    key={property.id}
                    property={property}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </Section>
    </div>
  );
};

export default ComplexDetails; 