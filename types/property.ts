export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
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
  category: string;
  complexName?: string;
  totalArea: number;
  livingArea?: number;
  floor?: number;
  apartmentStories?: number;
  buildingFloors?: number;
  livingRooms?: number;
  bedrooms: number;
  bathrooms: number;
  balconies: number;
  totalRooms: number;
  renovation?: 'cosmetic' | 'designer' | 'european' | 'needs-renovation';
  installment: boolean;
  parking: boolean;
  swimmingPool: boolean;
  gym: boolean;
  elevator: boolean;
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  currency: 'EUR' | 'USD' | 'GBP';
  location: string;
  type: string;
  status: 'for-sale' | 'for-rent';
  totalArea: number;
  bedrooms: number;
  bathrooms: number;
  area: number;
  category: 'apartment' | 'house' | 'villa' | 'land';
  images: string[];
  coverImage: string;
  complexName?: string;
  livingArea?: number;
  floor?: number;
  buildingFloors?: number;
  livingRooms?: number;
  balconies: number;
  totalRooms: number;
  renovation?: 'cosmetic' | 'designer' | 'european' | 'needs-renovation';
  installment: boolean;
  parking: boolean;
  swimmingPool: boolean;
  gym: boolean;
  elevator: boolean;
  yearBuilt?: number;
  furnished: boolean;
}

export const propertySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  currency: z.enum(['EUR', 'USD', 'GBP']),
  location: z.string().min(1),
  type: z.string().min(1),
  status: z.enum(['for-sale', 'for-rent']),
  totalArea: z.number().min(0),
  bedrooms: z.number().min(0),
  bathrooms: z.number().min(0),
  area: z.number().min(0),
  category: z.enum(['apartment', 'house', 'villa', 'land']),
  images: z.array(z.string()),
  coverImage: z.string(),
  complexName: z.string().optional(),
  livingArea: z.number().optional(),
  floor: z.number().optional(),
  buildingFloors: z.number().optional(),
  livingRooms: z.number().optional(),
  balconies: z.number(),
  totalRooms: z.number(),
  renovation: z.enum(['cosmetic', 'designer', 'european', 'needs-renovation']).optional(),
  installment: z.boolean(),
  parking: z.boolean(),
  swimmingPool: z.boolean(),
  gym: z.boolean(),
  elevator: z.boolean(),
  yearBuilt: z.number().optional(),
  furnished: z.boolean()
}); 