'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Section from '../sections/Section';
import { Bed, Bath, Square, MapPin, Star, Phone, Share2, Heart, ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import PropertyRating from '../PropertyRating';
import { useCurrency } from '@/components/ui/currency-selector';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PropertyDetailsProps {
  property: {
    id: string;
    title: string;
    description: string;
    price: number;
    location: string;
    type: string;
    status: string;
    specs: {
      beds: number;
      baths: number;
      area: number;
    };
    coverImage: string;
    images: string[];
    ratings: any[];
    owner: any;
    createdAt: string;
    totalRatings: number;
    averageRating: number;
    likedBy: any[];
  };
}

const PropertyDetails = ({ property }: PropertyDetailsProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (session?.user && property.likedBy) {
      setIsFavorite(property.likedBy.some(user => user.id === session.user.id));
    }
  }, [session, property.likedBy]);

  const handleRate = async (value: number) => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to rate properties",
        variant: "destructive"
      });
      return;
    }

    try {
      const response = await fetch(`/api/properties/${property.id}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });

      if (!response.ok) throw new Error('Failed to rate property');

      toast({
        title: "Success",
        description: "Rating submitted successfully",
      });
    } catch (error) {
      console.error('Error rating property:', error);
      toast({
        title: "Error",
        description: "Failed to submit rating",
        variant: "destructive"
      });
    }
  };

  const handleFavorite = async () => {
    if (!session?.user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to save properties",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/properties/${property.id}/favorite`, {
        method: isFavorite ? 'DELETE' : 'POST',
      });

      if (!response.ok) throw new Error('Failed to update favorite status');

      setIsFavorite(!isFavorite);
      toast({
        title: isFavorite ? "Removed from favorites" : "Added to favorites",
        description: isFavorite 
          ? "Property removed from your favorites" 
          : "Property added to your favorites",
      });
    } catch (error) {
      console.error('Error updating favorite status:', error);
      toast({
        title: "Error",
        description: "Failed to update favorite status",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Section>
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Images */}
            <div className="space-y-4">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src={property.images[currentImage]}
                  alt={property.title}
                  fill
                  className="object-cover"
                  priority
                />
                {property.images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full hover:bg-white"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                  </>
                )}
              </div>

              {/* Thumbnails */}
              {property.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {property.images.map((image, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImage(index)}
                      className={cn(
                        "relative aspect-square overflow-hidden rounded-lg",
                        currentImage === index && "ring-2 ring-primary"
                      )}
                    >
                      <Image
                        src={image}
                        alt={`${property.title} - image ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: Info */}
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {property.title}
                </h1>
                <p className="text-lg text-gray-600 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  {property.location}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Bed className="w-5 h-5 text-gray-400" />
                  <span>{property.specs.beds} beds</span>
                </div>
                <div className="flex items-center gap-2">
                  <Bath className="w-5 h-5 text-gray-400" />
                  <span>{property.specs.baths} baths</span>
                </div>
                <div className="flex items-center gap-2">
                  <Square className="w-5 h-5 text-gray-400" />
                  <span>{property.specs.area} м²</span>
                </div>
              </div>

              <div className="prose max-w-none">
                <p>{property.description}</p>
              </div>

              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-primary">
                  {formatPrice(property.price)}
                </div>
                <PropertyRating
                  propertyId={property.id}
                  currentRating={property.averageRating}
                  totalRatings={property.totalRatings}
                  userRating={property.ratings.find(r => r.userId === session?.user?.id)?.value}
                  onRate={handleRate}
                />
              </div>

              {/* Contact Info */}
              <div className="bg-gray-50 p-4 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">Contact Agent</h3>
                    <p className="text-sm text-gray-500">{property.owner.name}</p>
                  </div>
                  <Button>
                    <Phone className="w-4 h-4 mr-2" />
                    Contact
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={handleFavorite}
                  disabled={isSubmitting}
                >
                  <Heart 
                    className={cn(
                      "w-4 h-4 mr-2",
                      isFavorite && "fill-primary text-primary"
                    )} 
                  />
                  {isFavorite ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default PropertyDetails; 