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