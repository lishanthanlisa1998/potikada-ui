import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-products',
  imports: [CommonModule, RouterLink],
  templateUrl: './products.html',
  styleUrl: './products.css',
})
export class Products {

products: any[] = [];
  filtered: any[] = [];
  loading = true;
  searchTerm = '';
  activeCategory = 'all';
  categories = ['all', 'Books', 'Food', 'Oil'];

  deleteConfirmId: number | null = null;
  deleteLoading = false;

  constructor(
    private apiService: Api,
    private router: Router
  ) {}

  ngOnInit() { this.loadProducts(); }

  loadProducts() {
    this.loading = true;
    this.apiService.getAdminProducts().subscribe({
      next: (res) => {
        this.products = res;
        this.filtered = res;
        this.loading  = false;
      },
      error: () => { this.loading = false; }
    });
  }

  search(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.applyFilters();
  }

  filterCategory(cat: string) {
    this.activeCategory = cat;
    this.applyFilters();
  }

  applyFilters() {
    this.filtered = this.products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(this.searchTerm) ||
                          p.category.toLowerCase().includes(this.searchTerm);
      const matchCat    = this.activeCategory === 'all' ||
                          p.category === this.activeCategory;
      return matchSearch && matchCat;
    });
  }

  confirmDelete(id: number) {
    this.deleteConfirmId = id;
  }

  cancelDelete() {
    this.deleteConfirmId = null;
  }

  deleteProduct() {
    if (!this.deleteConfirmId) return;
    this.deleteLoading = true;
    this.apiService.deleteProduct(this.deleteConfirmId).subscribe({
      next: () => {
        this.products = this.products.filter(p => p.id !== this.deleteConfirmId);
        this.filtered = this.filtered.filter(p => p.id !== this.deleteConfirmId);
        this.deleteConfirmId = null;
        this.deleteLoading   = false;
      },
      error: () => { this.deleteLoading = false; }
    });
  }

  toggleActive(product: any) {
    this.apiService.updateProduct(product.id, {
      ...product,
      is_active: !product.is_active
    }).subscribe({
      next: () => { product.is_active = !product.is_active; }
    });
  }

  editProduct(id: number) {
    this.router.navigate(['/admin/products', id, 'edit']);
  }

  getPrimaryImage(product: any): string {
    const primary = product.images?.find((i: any) => i.is_primary);
    return primary?.image_url || product.images?.[0]?.image_url || '';
  }
}
