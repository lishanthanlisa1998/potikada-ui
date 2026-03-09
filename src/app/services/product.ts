import { Injectable } from '@angular/core';
import { Product } from '../models/product';

@Injectable({ providedIn: 'root' })
export class ProductService {

  private products: Product[] = [];

  getAll(): Product[] { return this.products; }

  getByCategory(cat: string): Product[] {
    return cat === 'all' ? this.products : this.products.filter(p => p.category === cat);
  }

  getById(id: number): Product | undefined {
    return this.products.find(p => p.id === id);
  }
}