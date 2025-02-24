import { z } from "zod";

export interface Property {
  id: string;
  title: string;
  description: string;
  price: number;
  currency: 'EUR' | 'USD' | 'GBP';
  type: string;
  status: 'for-rent' | 'for-sale';
  category: 'apartment' | 'house' | 'villa' | 'land';
  
  // Основные характеристики
  totalArea: number;
  bedrooms: number;
  bathrooms: number;
  livingArea: number;
  floor: number;
  buildingFloors: number;
  livingRooms: number;
  balconies: number;
  totalRooms: number;

  // Дополнительные характеристики
  parking: boolean;
  elevator: boolean;
  swimmingPool: boolean;
  gym: boolean;
  furnished: boolean;
  installment: boolean;

  renovation: 'cosmetic' | 'designer' | 'european' | 'needs-renovation' | null;
  complexName: string | null;
  
  // Изображения
  images: Array<{ url: string }>;
  coverImage: string | null;
  
  // Рейтинг
  propertyRating?: 'A' | 'B' | 'B+' | 'C' | 'D';
  
  // Мета-данные
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone?: string;
    image: string | null;
  };
  
  favorites: {
    userId: string;
  }[];

  latitude?: number;
  longitude?: number;

  moderated: boolean;
  rejected: boolean;
  rejectionReason?: string;

  documents: {
    id: string;
    url: string;
    type: string;
  }[];

  address?: {
    street: string;
    city: string;
    district: string;
    region: string;
    postalCode: string;
    buildingNumber?: string;
    block?: string;
  };
}

export interface PropertyFormData {
  title: string;
  description: string;
  price: number;
  currency: 'EUR' | 'USD' | 'GBP';
  type: 'apartment' | 'house' | 'villa' | 'land';
  status: 'for-sale' | 'for-rent';
  category: 'apartment' | 'house' | 'villa' | 'land';
  
  // Адресные поля
  street?: string;
  city?: string;
  district?: string;
  region?: string;
  postalCode?: string;
  buildingNumber?: string;
  block?: string;
  
  // Остальные поля...
  totalArea: number;
  livingArea: number;
  bedrooms: number;
  bathrooms: number;
  floor: number;
  buildingFloors: number;
  livingRooms: number;
  balconies: number;
  totalRooms: number;
  
  parking: boolean;
  elevator: boolean;
  swimmingPool: boolean;
  gym: boolean;
  furnished: boolean;
  installment: boolean;
  
  renovation?: 'cosmetic' | 'designer' | 'european' | 'needs-renovation';
  complexName?: string;
  
  images: string[];
  coverImage: string;
  
  latitude: number;
  longitude: number;
  
  documents?: {
    url: string;
    type: string;
  }[];
}

export interface Complex {
  id: string;
  name: string;
  // ... другие поля комплекса
} 