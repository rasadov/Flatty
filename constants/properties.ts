export interface Property {
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
    livingArea: number;
    totalRooms: number;
    floor: number;
    buildingFloors: number;
  };
  features: {
    parking: boolean;
    elevator: boolean;
    swimmingPool: boolean;
    gym: boolean;
  };
  coverImage: string;
  images: string[];
  ratings: any[];
  createdAt: string;
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  location: string;
  type: string;
  status: string;
  bedrooms: number;
  bathrooms: number;
  totalArea: number;
  livingArea: number;
  totalRooms: number;
  floor: number;
  buildingFloors: number;
  parking: boolean;
  elevator: boolean;
  swimmingPool: boolean;
  gym: boolean;
  images: string[];
  coverImage: string;
}

// Опции для фильтров
export const propertyTypes = [
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'land', label: 'Land' }
];

export const priceRanges = [
  { value: '0-100000', label: 'Up to €100k' },
  { value: '100000-200000', label: '€100k - €200k' },
  { value: '200000-300000', label: '€200k - €300k' },
  { value: '300000-500000', label: '€300k - €500k' },
  { value: '500000-1000000', label: '€500k - €1M' },
  { value: '1000000', label: 'Over €1M' }
];

export const bedroomOptions = [
  { value: '1', label: '1 Bedroom' },
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4', label: '4 Bedrooms' },
  { value: '5', label: '5+ Bedrooms' }
];

export const sortOptions = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' }
]; 