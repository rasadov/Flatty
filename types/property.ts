import { z } from "zod";

export const propertySchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().min(0),
  currency: z.string(),
  location: z.string().min(1),
  type: z.string(),
  status: z.string(),
  totalArea: z.number().min(0),
  livingArea: z.number(),
  bedrooms: z.number().min(1),
  bathrooms: z.number().min(1),
  floor: z.number(),
  buildingFloors: z.number(),
  parking: z.boolean(),
  elevator: z.boolean()
});

export type PropertyFormData = z.infer<typeof propertySchema>;

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: string;
  location: string;
  type: string;
  status: string;
  totalArea: number;
  livingArea: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  buildingFloors: number;
  parking: boolean;
  elevator: boolean;
  coverImage?: string;
  images?: { url: string }[];
  createdAt: string;
  updatedAt: string;
  ownerId: string;
} 