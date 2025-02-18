'use client';

import { Property } from '@/constants/properties';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useCurrency } from '@/components/ui/currency-selector';
import { BookmarkPlus, Edit } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useState } from 'react';
import EditPropertyDialog from '@/components/profile/EditPropertyDialog';

interface PropertyCardProps {
  property: Property;
  id: string | number;
  title: string;
  description: string;
  price: number;
  livingArea?: number;
  location: string;
  type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  totalArea: number;
  coverImage?: string;
  images?: string[];
  ratings: any[];
  totalRatings: number;
  likedBy: any[];
  floor?: number;
  apartmentStories?: number;
  buildingFloors?: number;
  livingRooms?: number;
  balconies?: number;
  totalRooms?: number;
  renovation?: string;
  furnishing?: string;
  isUserProperty?: boolean;
}

const PropertyCard = ({ isUserProperty, ...props }: PropertyCardProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const displayImage = props.coverImage 
    ? props.coverImage
    : props.images && props.images.length > 0 
      ? props.images[0]
      : '/images/placeholder.jpg';

  const isS3Image = displayImage.includes('s3.amazonaws.com');

  const handleClick = () => {
    router.push(`/properties/${props.id}`);
  };

  const handleSaveSearch = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход на страницу объекта

    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save searches",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch('/api/user/saved-searches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: props.title,
          criteria: {
            propertyType: props.type,
            location: props.location,
            price: props.price,
            beds: props.bedrooms,
            baths: props.bathrooms,
            area: props.totalArea
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save search');
      }

      toast({
        title: "Success",
        description: "Search criteria saved successfully",
      });
    } catch (error) {
      console.error('Error saving search:', error);
      toast({
        title: "Error",
        description: "Failed to save search. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Вычисляем рейтинг на основе массива ratings
  const rating = (props.ratings ?? []).length > 0
  ? props.ratings.reduce((acc, r) => acc + r.value, 0) / props.ratings.length
  : 0;

  // Проверяем, поставил ли текущий пользователь рейтинг
  

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation(); // Предотвращаем переход на страницу объекта
    setIsEditDialogOpen(true);
  };

  return (
    <>
      <div 
        onClick={handleClick}
        className={cn(
          "group relative overflow-hidden transition-all duration-300 h-full cursor-pointer",
          "bg-white rounded-xl border border-gray-100",
          "hover:shadow-lg hover:border-gray-200"
        )}
      >
        {/* Image Container */}
        <div className="relative w-full h-[240px] overflow-hidden rounded-t-xl">
          <Image
            src={displayImage}
            alt={props.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            priority={false}
            quality={75}
            unoptimized={isS3Image}
            onError={(e) => {
              console.log("Property image load error:", e);
              e.currentTarget.src = '/images/placeholder.jpg';
            }}
          />
          
          {/* Показываем индикатор только если используется именно coverImage */}
          
         
       

          {/* Рейтинг поверх изображения */}
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/70 px-2  rounded-lg ">
            <span className="text-primary text-base font-bold">B+</span>
         
            {/* <span className="text-sm font-medium text-gray-700">
              {((props.ratings ?? []).length > 0
                ? props.ratings.reduce((acc, r) => acc + r.value, 0) / props.ratings.length
                : 0).toFixed(1)}
            </span> */}
            
            {/* <span className="text-xs text-gray-500">
              ({props.totalRatings})
            </span> */}
          </div>

          

          {/* Градиент поверх изображения для лучшей читаемости */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>

        {/* Content Container */}
        <div className="p-4 bg-white border-t border-gray-100">
          {/* Title & Location */}
         <div className='flex'>
         <div className="mb-3">
            <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">
              {props.title}
            </h3>
            <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
              {props.location} <span>📍</span>
            </p>
          </div>

         
                 {isUserProperty && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleEdit}
              className="ml-auto bg-primary text-white"
            >
              <Edit className="w-4 h-4 mr-1 bg-primary text-white" />
              Edit
            </Button>
          )}
         </div>
       

          {/* Specs & Price */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <span className="text-gray-400">🛏</span>
                <span className="text-sm font-medium text-gray-600">{props.bedrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">🚿</span>
                <span className="text-sm font-medium text-gray-600">{props.bathrooms}</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-gray-400">📏</span>
                <span className="text-sm font-medium text-gray-600">{props.totalArea} м²</span>
              </div>
            </div>
            <div className="text-lg font-bold text-primary">
              {formatPrice(props.price)}
            </div>
          </div>

          
        </div>

        {/* Save Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 hover:bg-white"
          onClick={(e) => {
            e.stopPropagation();
            handleSaveSearch(e);
          }}
        >
          <BookmarkPlus className="w-5 h-5" />
        </Button>
      </div>

      {isUserProperty && (
        <EditPropertyDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            console.log('Dialog closing');
            setIsEditDialogOpen(false);
          }}
          property={props.property}
          onUpdate={(updatedProperty) => {
            console.log('Property update callback:', updatedProperty);
            setIsEditDialogOpen(false);
          }}
        />
      )}
    </>
  );
};

export default PropertyCard; 