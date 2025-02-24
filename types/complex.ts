import { z } from 'zod';
import { Property } from './property';

export interface Complex {
  id: string;
  name: string;
  category: 'apartment' | 'house' | 'villa';
  buildingArea: number;
  livingArea: number;
  totalObjects: number;
  floors: number;
  yearBuilt: number;
  
  parking: boolean;
  installment: boolean;
  swimmingPool: boolean;
  elevator: boolean;
  
  description: string;
  
  images: Array<{ url: string }>;
  coverImage?: string;
  
  properties: Property[];
  ownerId: string;
  owner?: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
  };
  
  createdAt: string;
  updatedAt: string;
  moderated: boolean;
  rejected: boolean;
  rejectionReason?: string;
  propertyRating?: 'A' | 'B' | 'B+' | 'C' | 'D';
}

export const complexSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category: z.string(),
  buildingArea: z.union([z.number(), z.string()]).transform(val => Number(val)),
  livingArea: z.union([z.number(), z.string()]).transform(val => Number(val)),
  totalObjects: z.union([z.number(), z.string()]).transform(val => Number(val)),
  floors: z.union([z.number(), z.string()]).transform(val => Number(val)),
  yearBuilt: z.union([z.number(), z.string()]).transform(val => Number(val)),
  parking: z.boolean(),
  installment: z.boolean(),
  swimmingPool: z.boolean(),
  elevator: z.boolean(),
  description: z.string(),
  images: z.array(z.object({ url: z.string() })),
  coverImage: z.string()
});

export type ComplexFormData = z.infer<typeof complexSchema>; 