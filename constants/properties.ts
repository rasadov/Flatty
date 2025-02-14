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
  };
  coverImage: string;
  images: string[];
  ratings: any[];
  createdAt: string;
}

// Опции для фильтров
export const propertyTypes = [
  { value: 'all', label: 'All Types' },
  { value: 'apartment', label: 'Apartment' },
  { value: 'house', label: 'House' },
  { value: 'villa', label: 'Villa' },
  { value: 'complex', label: 'Complex' }
];

export const priceRanges = [
  { value: 'all', label: 'Any Price' },
  { value: '0-300000', label: 'Up to £300,000' },
  { value: '300000-500000', label: '£300,000 - £500,000' },
  { value: '500000-1000000', label: '£500,000 - £1,000,000' },
  { value: '1000000+', label: '£1,000,000+' }
];

export const bedroomOptions = [
  { value: 'all', label: 'Any Beds' },
  { value: '1', label: '1 Bedroom' },
  { value: '2', label: '2 Bedrooms' },
  { value: '3', label: '3 Bedrooms' },
  { value: '4+', label: '4+ Bedrooms' }
];

export const sortOptions = [
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'newest', label: 'Newest First' }
]; 