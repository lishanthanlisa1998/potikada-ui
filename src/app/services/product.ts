import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {

  private products: Product[] = [
    {
      id: 1,
      name: 'Neeye en Kaadhali',
      category: 'Books',
      image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&q=80',
      images: [
        'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800&q=80',
        'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&q=80',
        'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80'
      ],
      price: 699,
      originalPrice: 999,
      badge: 'Sale',
      offerTag: 'Buy 2 Get 1 Free',
      hearts: 5,
      shareLink: 'https://potikada.com/p/1',
      unit: 'Per copy',
      author: 'Lisa',
      brand: 'Potikada Books',
      sizes: ['S', 'M', 'L', 'XL'],
      deliveryPrice: 199,
      deliveryDate: '18–20 March',
      description: 'This heartfelt novel tells the story of love, longing, and the ties that bind us. Written with passion and depth, "Neeye en Kaadhali" takes you on an emotional journey through the lives of its beautifully crafted characters. A must-read for anyone who believes in the power of love.'
    },
    {
      id: 2,
      name: 'Potikada Natural Oil',
      category: 'Oil',
      image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80',
      images: [
        'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=800&q=80',
        'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=800&q=80',
        'https://images.unsplash.com/photo-1601039641847-7857b994d704?w=800&q=80'
      ],
      price: 850,
      originalPrice: 850,
      badge: 'New',
      offerTag: null,
      hearts: 4,
      shareLink: 'https://potikada.com/p/2',
      unit: 'Per bottle',
      author: 'Potikada',
      brand: 'Potikada Oils',
      sizes: ['250ml', '500ml', '1L'],
      deliveryPrice: 199,
      deliveryDate: '18–20 March',
      description: 'Pure cold-pressed natural oil handcrafted by local artisans. No additives, no preservatives — just 100% natural goodness straight from the village.'
    },
    {
      id: 3,
      name: 'Fresh Smoothie Pack',
      category: 'Food',
      image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=400&q=80',
      images: [
        'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800&q=80',
        'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=800&q=80',
        'https://images.unsplash.com/photo-1600718374662-0483d2b9da44?w=800&q=80'
      ],
      price: 450,
      originalPrice: 600,
      badge: 'Sale',
      offerTag: 'Buy 2 Get 1 Free',
      hearts: 4,
      shareLink: 'https://potikada.com/p/3',
      unit: 'Per pack',
      author: 'Potikada',
      brand: 'Potikada Fresh',
      sizes: ['Small', 'Medium', 'Large'],
      deliveryPrice: 199,
      deliveryDate: '18–20 March',
      description: 'Fresh handmade smoothie packs made daily using locally sourced fruits and vegetables. No sugar added, no artificial flavors — just pure fresh goodness.'
    },
    {
      id: 4,
      name: 'Herbal Tea Collection',
      category: 'Food',
      image: 'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=400&q=80',
      images: [
        'https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?w=800&q=80',
        'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=800&q=80',
        'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?w=800&q=80'
      ],
      price: 550,
      originalPrice: 550,
      badge: null,
      offerTag: null,
      hearts: 5,
      shareLink: 'https://potikada.com/p/4',
      unit: 'Per box',
      author: 'Potikada',
      brand: 'Potikada Tea',
      sizes: ['Small', 'Medium', 'Large'],
      deliveryPrice: 199,
      deliveryDate: '18–20 March',
      description: 'A curated collection of premium herbal teas sourced from local gardens. Includes chamomile, ginger, and peppermint blends — perfect for relaxation and wellness.'
    }
  ];

  getAll(): Product[] { return this.products; }

  getByCategory(cat: string): Product[] {
    return cat === 'all' ? this.products : this.products.filter(p => p.category === cat);
  }

  getById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }
}