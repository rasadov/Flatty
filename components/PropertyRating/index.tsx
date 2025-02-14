'use client';

import { useState } from 'react';
import { Star } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import Button from '../ui/button';

interface PropertyRatingProps {
  propertyId: number;
  currentRating: number;
  totalRatings: number;
  userRating?: number;
  onRate: (rating: number) => Promise<void>;
}

const PropertyRating = ({ 
  propertyId, 
  currentRating, 
  totalRatings, 
  userRating,
  onRate 
}: PropertyRatingProps) => {
  const { data: session } = useSession();
  const [isHovering, setIsHovering] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRate = async (rating: number) => {
    if (!session) return;
    
    try {
      setIsSubmitting(true);
      await onRate(rating);
    } catch (error) {
      console.error('Failed to rate property:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <div 
          className="flex items-center gap-1" 
          onMouseLeave={() => {
            setIsHovering(false);
            setHoverRating(0);
          }}
        >
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              disabled={!session || isSubmitting}
              onClick={() => handleRate(rating)}
              onMouseEnter={() => {
                setIsHovering(true);
                setHoverRating(rating);
              }}
              className={cn(
                "transition-colors",
                !session && "cursor-not-allowed opacity-70"
              )}
            >
              <Star 
                className={cn(
                  "w-6 h-6",
                  isHovering
                    ? rating <= hoverRating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                    : rating <= (userRating || currentRating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "text-gray-300"
                )}
              />
            </button>
          ))}
        </div>
        <span className="text-sm text-gray-500">
          ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
        </span>
      </div>

      {!session && (
        <p className="text-sm text-gray-500">
          Please <Button variant="link" className="p-0">sign in</Button> to rate this property
        </p>
      )}
      
      {session && userRating && (
        <p className="text-sm text-gray-500">
          Your rating: {userRating}/5
        </p>
      )}
    </div>
  );
};

export default PropertyRating; 