import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-product-form',
  imports: [CommonModule, FormsModule],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm implements OnInit {

  isEdit = false;
  productId: number | null = null;
  loading = false;
  saving  = false;
  error   = '';
  success = '';

  // Form fields
  form: any = {
    name:           '',
    category:       'Books',
    price:          0,
    original_price: 0,
    badge:          '',
    offer_tag:      '',
    unit:           '',
    author:         '',
    brand:          '',
    delivery_price: 199,
    delivery_date:  '',
    description:    '',
    is_active:      true,
    sizes:          [] as string[],
    images:         [] as string[],
  };

  // Size management
  newSize     = '';
  categories  = ['Books', 'Food', 'Oil', 'Other'];
  badges      = ['', 'Sale', 'New'];

  // Image management
  newImageUrl    = '';
  imageFiles:    File[] = [];
  imagePreviews: string[] = [];

  // Existing images (edit mode)
  existingImages: any[]   = [];
  deleteImageIds: number[] = [];

  constructor(
    private apiService: Api,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEdit    = true;
      this.productId = +id;
      this.loadProduct(+id);
    }
  }

  loadProduct(id: number) {
    this.loading = true;
    this.apiService.getAdminProducts().subscribe({
      next: (products) => {
        const product = products.find((p: any) => p.id === id);
        if (product) {
          this.form = {
            name:           product.name,
            category:       product.category,
            price:          product.price,
            original_price: product.original_price,
            badge:          product.badge || '',
            offer_tag:      product.offer_tag || '',
            unit:           product.unit,
            author:         product.author || '',
            brand:          product.brand || '',
            delivery_price: product.delivery_price,
            delivery_date:  product.delivery_date || '',
            description:    product.description || '',
            is_active:      product.is_active,
            sizes:          product.sizes || [],
            images:         [],
          };
          this.existingImages = product.images || [];
        }
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  // ===== SIZES =====
  addSize() {
    const s = this.newSize.trim();
    if (s && !this.form.sizes.includes(s)) {
      this.form.sizes = [...this.form.sizes, s];
      this.newSize = '';
    }
  }

  removeSize(size: string) {
    this.form.sizes = this.form.sizes.filter((s: string) => s !== size);
  }

  // ===== IMAGE URL =====
  addImageUrl() {
    const url = this.newImageUrl.trim();
    if (url && !this.form.images.includes(url)) {
      this.form.images = [...this.form.images, url];
      this.newImageUrl = '';
    }
  }

  removeImageUrl(url: string) {
    this.form.images = this.form.images.filter((u: string) => u !== url);
  }

  // ===== FILE UPLOAD =====
  onFileSelected(event: any) {
    const files: File[] = Array.from(event.target.files);
    files.forEach(file => {
      this.imageFiles.push(file);
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreviews.push(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  }

  removeFilePreview(index: number) {
    this.imageFiles.splice(index, 1);
    this.imagePreviews.splice(index, 1);
  }

  // ===== EXISTING IMAGE DELETE =====
  markDeleteImage(id: number) {
    this.deleteImageIds.push(id);
    this.existingImages = this.existingImages.filter(i => i.id !== id);
  }

  // ===== SAVE =====
  save() {
    if (!this.form.name || !this.form.price || !this.form.description) {
      this.error = 'Please fill in all required fields.';
      return;
    }
    if (this.form.sizes.length === 0) {
      this.error = 'Please add at least one size.';
      return;
    }
    if (this.form.images.length === 0 &&
        this.imageFiles.length === 0 &&
        this.existingImages.length === 0) {
      this.error = 'Please add at least one image.';
      return;
    }

    this.saving = true;
    this.error  = '';

    const payload = {
      ...this.form,
      badge:    this.form.badge    || null,
      offer_tag:this.form.offer_tag|| null,
      author:   this.form.author   || null,
      brand:    this.form.brand    || null,
      ...(this.deleteImageIds.length > 0
        ? { delete_image_ids: this.deleteImageIds }
        : {})
    };

    const request = this.isEdit && this.productId
      ? this.apiService.updateProduct(this.productId, payload)
      : this.apiService.createProduct(payload);

    request.subscribe({
      next: () => {
        this.saving  = false;
        this.success = this.isEdit
          ? 'Product updated successfully!'
          : 'Product created successfully!';
        setTimeout(() => this.router.navigate(['/admin/products']), 1500);
      },
      error: (err) => {
        this.saving = false;
        this.error  = err.error?.message || 'Something went wrong.';
      }
    });
  }

  goBack() { this.router.navigate(['/admin/products']); }
}