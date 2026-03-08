
export interface Product {
  id: number;
  name: string;
  category: string;
  image: string;
  images: string[];
  price: number;
  originalPrice: number;
  badge: 'Sale' | 'New' | null;
  offerTag: string | null;
  hearts: number;
  shareLink: string;
  unit: string;
  author: string;
  brand: string;
  sizes: string[];
  deliveryPrice: number;
  deliveryDate: string;
  description: string;
}