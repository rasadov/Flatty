export interface Agent {
  id: string;
  name: string;
  image: string | null;
  email: string;
  phone: string | null;
  countryCode: string | null;
  description: string | null;
  experience: number | null;
  licenseNumber: string | null;
  listings: { id: string }[];
  _count: {
    reviews: number;
  };
  rating: number;
} 