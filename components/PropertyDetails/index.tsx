'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import Section from '../sections/Section';
import { 
  Bed, Bath, Square, MapPin, Phone, Share2, Heart, ArrowLeft, 
  ChevronLeft, ChevronRight, Building2, Building, DoorClosed, Home,
  Car, Lift, Swimming, Dumbbell, Sofa, CreditCard, Paintbrush
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import PropertyRating from '../PropertyRating';
import { useCurrency } from '@/components/ui/currency-selector';
import { useToast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Property } from '@/types/property';
import Link from 'next/link';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useJsApiLoader } from '@react-google-maps/api';

interface PropertyDetailsProps {
  property: Property & {
    owner: {
      id: string;
      name: string;
      email: string;
      phone?: string;
      image: string | null;
    };
  };
}

interface PropertyImage {
  url: string;
}

const formatAddress = (property: Property) => {
  const addressParts = [];

  // Первая строка: улица, номер здания и блок
  if (property.street) {
    let streetPart = property.street;
    if (property.buildingNumber) {
      streetPart += ` ${property.buildingNumber}`;
    }
    if (property.block) {
      streetPart += `, Block ${property.block}`;
    }
    addressParts.push(streetPart);
  }

  // Вторая строка: город, район, регион
  const locationParts = [];
  if (property.city) {
    locationParts.push(property.city);
  }
  if (property.district) {
    locationParts.push(property.district);
  }
  if (property.region) {
    locationParts.push(property.region);
  }
  if (locationParts.length > 0) {
    addressParts.push(locationParts.join(', '));
  }

  // Почтовый индекс
  if (property.postalCode) {
    addressParts.push(property.postalCode);
  }

  return addressParts.join(' • ');
};

const PropertyDetails = ({ property }: PropertyDetailsProps) => {
  const router = useRouter();
  const { data: session } = useSession();
  const { formatPrice } = useCurrency();
  const { toast } = useToast();
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  console.log('PropertyDetails received property:', JSON.stringify(property, null, 2));

  const allImages = useMemo(() => {
    const images: string[] = [];
    
    if (property.coverImage) {
      images.push(property.coverImage);
    }

    if (Array.isArray(property.images)) {
      property.images.forEach(img => {
        const imageUrl = typeof img === 'string' ? img : img.url;
        if (imageUrl && !images.includes(imageUrl)) {
          images.push(imageUrl);
        }
      });
    }

    console.log('Processed images:', images);
    return images;
  }, [property.coverImage, property.images]);

  const nextImage = () => {
    setCurrentImage((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setCurrentImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const selectImage = (index: number) => {
    setCurrentImage(index);
  };

  useEffect(() => {
    console.log('Property data check:', {
      hasImages: property.images?.length > 0,
      hasOwner: !!property.owner,
      ownerDetails: property.owner,
      basicInfo: {
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        totalArea: property.totalArea,
        livingArea: property.livingArea,
      },
      amenities: {
        parking: property.parking,
        elevator: property.elevator,
        swimmingPool: property.swimmingPool,
        gym: property.gym,
      }
    });

    if (session?.user && property.favorites) {
      setIsFavorite(property.favorites.some(fav => fav.userId === session.user.id));
    }
  }, [session, property.favorites]);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'for-sale':
        return 'bg-green-100 text-green-800';
      case 'for-rent':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRenovationLabel = (renovation: string | null) => {
    switch (renovation) {
      case 'cosmetic':
        return 'Cosmetic';
      case 'designer':
        return 'Designer';
      case 'european':
        return 'European';
      case 'needs-renovation':
        return 'Needs Renovation';
      default:
        return 'Not Specified';
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case 'A':
        return 'bg-green-100 text-green-800';
      case 'B+':
        return 'bg-blue-100 text-blue-800';
      case 'B':
        return 'bg-blue-50 text-blue-600';
      case 'C':
        return 'bg-yellow-100 text-yellow-800';
      case 'D':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-green-100 text-green-800'; // для 'A' по умолчанию
    }
  };

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!
  });

  const center = useMemo(() => ({
    lat: property.latitude || 35.1856,
    lng: property.longitude || 33.3823
  }), [property.latitude, property.longitude]);

  const mapOptions = {
    clickableIcons: false,
    streetViewControl: false,
    mapTypeControlOptions: { mapTypeIds: [] },
    zoomControl: true,
    scrollwheel: false,
    disableDefaultUI: false,
    zoom: 15
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Section>
        <div className="container mx-auto px-0 sm:px-4">
          {/* <Button
            variant="ghost"
            className="mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button> */}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-4">
            <div className="lg:col-span-7 space-y-6">
              {allImages.length > 0 ? (
                <div className="relative h-[300px] sm:h-[500px] rounded-xl overflow-hidden">
                  <Swiper
                    modules={[Navigation, Pagination]}
                    navigation={true}
                    pagination={{ clickable: true }}
                    loop={allImages.length > 1}
                    className="h-full"
                  >
                    {allImages.map((image, index) => (
                      <SwiperSlide key={index}>
                        <div className="relative w-full h-full">
                          <Image
                            src={image}
                            alt={`${property.title} - Image ${index + 1}`}
                            fill
                            className="object-cover"
                            priority={index === 0}
                          />
                        </div>
                      </SwiperSlide>
                    ))}
                  </Swiper>
                </div>
              ) : (
                <div className="relative h-[500px] rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                  <Image
                    src="/images/placeholder.png"
                    alt="No image available"
                    width={200}
                    height={200}
                    className="opacity-50"
                  />
                </div>
              )}

              {allImages.length > 1 && (
                <div className="overflow-x-auto pb-2">
                  <div className="flex gap-2">
                    {allImages.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => selectImage(index)}
                        className={cn(
                          "relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden",
                          currentImage === index && "ring-2 ring-primary"
                        )}
                      >
                        <Image
                          src={image}
                          alt={`${property.title} - thumbnail ${index + 1}`}
                          fill
                          className="object-cover hover:opacity-75 transition-opacity"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="h-[300px] relative">
                  {isLoaded && (
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={center}
                      options={mapOptions}
                    >
                      <Marker
                        position={center}
                        title={property.title}
                      />
                    </GoogleMap>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">Location</h3>
                  <p className="text-gray-600 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    {formatAddress(property)}
                  </p>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="space-y-6">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {property.title}
                      </h1>
                      <span className={cn(
                        "px-3 py-1 rounded-full text-sm font-medium",
                        getStatusColor(property.status)
                      )}>
                        {property.status === 'for-sale' ? 'For Sale' : 'For Rent'}
                      </span>
                    </div>
                    <p className="text-2xl font-bold text-primary">
                      {formatPrice(property.price)} {property.currency}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Bed className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{property.bedrooms}</p>
                        <p className="text-sm text-gray-500">Bedrooms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Bath className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{property.bathrooms}</p>
                        <p className="text-sm text-gray-500">Bathrooms</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Square className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{property.totalArea}</p>
                        <p className="text-sm text-gray-500">Total m²</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Home className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium">{property.livingArea}</p>
                        <p className="text-sm text-gray-500">Living m²</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-2">Description</h3>
                    <p className="text-gray-600">{property.description}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
                <div className="sm:flex items-center justify-between">
                  <Link 
                    href={`/users/${property.owner.id}`} 
                    className="flex items-center gap-3 hover:bg-gray-50 p-2 rounded-lg transition-colors"
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={property.owner.image || '/images/default-avatar.png'}
                        alt={property.owner.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{property.owner.name}</p>
                      <p className="text-sm text-gray-500">{property.owner.email}</p>
                      {property.owner.phone && (
                        <p className="text-sm text-gray-500">{property.owner.phone}</p>
                      )}
                    </div>
                  </Link>
                  <div className="flex flex-col gap-2">
                    <Button>
                      <Phone className="w-4 h-4 mr-2" />
                      Contact
                    </Button>
                    <Button variant="outline" onClick={handleFavorite}>
                      <Heart className={cn("w-4 h-4 mr-2", isFavorite && "fill-primary text-primary")} />
                      {isFavorite ? 'Saved' : 'Save'}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
};

export default PropertyDetails; 
