import { CommonModule, DOCUMENT } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Api } from '../../../services/api';
import { environment } from '../../../../environments/environment';
import { CountInStockPipe } from '../../../pipes/count-in-stock-pipe';
import { Popup, PopupConfig } from '../../shared/popup/popup';

@Component({
  selector: 'app-product-form',
  standalone: true,
  imports: [CommonModule, FormsModule, CountInStockPipe, Popup],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class ProductForm implements OnInit {

  isEdit    = false;
  productId: number | null = null;
  loading   = false;
  saving    = false;
  popup: PopupConfig | null = null;

  form: any = {
    name: '', category: 'Books', price: 0, original_price: 0,
    badge: '', offer_tag: '', unit: '', maker_label: 'Author',
    maker_name: '', weight_grams: 0, delivery_price: 199,
    delivery_date: '', description: '', is_active: true,
    images: [] as string[],
  };

  categories  = ['Books', 'Food', 'Oil', 'Clothing', 'Other'];
  badges      = ['', 'Sale', 'New'];
  makerLabels = ['Author', 'Made by', 'Stitched by', 'Manufactured by', 'Packed by', 'Created by', 'Grown by'];

  sizeOptions:   string[] = [];
  colorOptions:  { name: string; hex: string }[] = [];
  designOptions: string[] = [];

  newSizeName   = '';
  newColorName  = '';
  newColorHex   = '#000000';
  newDesignName = '';

  variants: any[] = [];
  newVariant = { size: '', color: '', color_hex: '', design: '', price: null as number | null, stock: 0, weight_grams: 0, image: '', is_default: false };

  newImageUrl     = '';
  uploadingImage  = false;
  existingImages: any[]    = [];
  deleteImageIds: number[] = [];

  constructor(
    private apiService: Api,
    private router: Router,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: Document
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.params['id'];
    if (id) { this.isEdit = true; this.productId = +id; this.loadProduct(+id); }
    this.apiService.getCategories().subscribe({
      next: (cats: any[]) => { if (cats.length) this.categories = cats.map(c => c.name); }
    });
  }

  loadProduct(id: number) {
    this.loading = true;
    this.apiService.getAdminProduct(id).subscribe({
      next: (res: any) => {
        const p = res.product ?? res;
        this.form = {
          name: p.name, category: p.category, price: p.price,
          original_price: p.original_price, badge: p.badge || '',
          offer_tag: p.offer_tag || '', unit: p.unit,
          maker_label: p.maker_label || 'Author', maker_name: p.maker_name || '',
          weight_grams: p.weight_grams || 0, delivery_price: p.delivery_price,
          delivery_date: p.delivery_date || '', description: p.description || '',
          is_active: p.is_active, images: [],
        };
        this.existingImages = p.images || [];
        const vars = p.variants || [];
        this.variants = vars.map((v: any) => ({ ...v }));
        this.sizeOptions   = [...new Set<string>(vars.filter((v:any) => v.size).map((v:any) => v.size))];
        this.designOptions = [...new Set<string>(vars.filter((v:any) => v.design).map((v:any) => v.design))];
        const seen = new Set<string>();
        this.colorOptions  = [];
        vars.filter((v:any) => v.color).forEach((v:any) => {
          if (!seen.has(v.color)) { seen.add(v.color); this.colorOptions.push({ name: v.color, hex: v.color_hex || '#000000' }); }
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.popup = { type: 'error', title: 'Load Failed', message: 'Could not load product. Please try again.' };
      }
    });
  }

  // ── Options ──────────────────────────────────
  addSizeOption() {
    const s = this.newSizeName.trim();
    if (s && !this.sizeOptions.includes(s)) { this.sizeOptions.push(s); this.newSizeName = ''; }
  }
  removeSizeOption(s: string) {
    this.sizeOptions = this.sizeOptions.filter(x => x !== s);
    this.variants = this.variants.filter(v => v.size !== s);
  }
  addColorOption() {
    const c = this.newColorName.trim();
    if (c && !this.colorOptions.find(x => x.name === c)) {
      this.colorOptions.push({ name: c, hex: this.newColorHex });
      this.newColorName = ''; this.newColorHex = '#000000';
    }
  }
  removeColorOption(name: string) {
    this.colorOptions = this.colorOptions.filter(x => x.name !== name);
    this.variants = this.variants.filter(v => v.color !== name);
  }
  addDesignOption() {
    const d = this.newDesignName.trim();
    if (d && !this.designOptions.includes(d)) { this.designOptions.push(d); this.newDesignName = ''; }
  }
  removeDesignOption(d: string) {
    this.designOptions = this.designOptions.filter(x => x !== d);
    this.variants = this.variants.filter(v => v.design !== d);
  }

  onNewVariantColorChange() {
    const found = this.colorOptions.find(c => c.name === this.newVariant.color);
    this.newVariant.color_hex = found?.hex || '#000000';
  }

  // ── Add variant combo ─────────────────────────
  addVariant() {
    if (!this.newVariant.size && !this.newVariant.color && !this.newVariant.design) {
      this.popup = { type: 'warning', title: 'Select an Option', message: 'Please pick at least one option — Size, Color, or Design.' };
      return;
    }
    const isDup = this.variants.some(v =>
      (v.size||'') === (this.newVariant.size||'') &&
      (v.color||'') === (this.newVariant.color||'') &&
      (v.design||'') === (this.newVariant.design||'')
    );
    if (isDup) {
      this.popup = { type: 'warning', title: 'Duplicate!', message: 'This combination already exists. Try a different one.' };
      return;
    }
    const isFirst = this.variants.length === 0;
    this.variants.push({
      size:         this.newVariant.size   || null,
      color:        this.newVariant.color  || null,
      color_hex:    this.newVariant.color_hex || null,
      design:       this.newVariant.design || null,
      price:        this.newVariant.price  ?? this.form.price,
      stock:        this.newVariant.stock  || 0,
      weight_grams: this.newVariant.weight_grams || this.form.weight_grams,
      image:        this.newVariant.image  || null,
      is_default:   isFirst,
    });
    this.newVariant = { size: '', color: '', color_hex: '', design: '', price: null, stock: 0, weight_grams: 0, image: '', is_default: false };
  }

  removeVariant(index: number) {
    const wasDefault = this.variants[index].is_default;
    this.variants.splice(index, 1);
    if (wasDefault && this.variants.length > 0) this.variants[0].is_default = true;
  }

  setDefault(index: number) {
    this.variants.forEach((v, i) => v.is_default = i === index);
  }

  variantLabel(v: any): string {
    return [v.size, v.color, v.design].filter(Boolean).join(' + ');
  }

  // ── Images ───────────────────────────────────
  addImageUrl() {
    const url = this.newImageUrl.trim();
    if (url && !this.form.images.includes(url)) { this.form.images = [...this.form.images, url]; this.newImageUrl = ''; }
  }
  removeImageUrl(url: string) { this.form.images = this.form.images.filter((u: string) => u !== url); }
  markDeleteImage(id: number) { this.deleteImageIds.push(id); this.existingImages = this.existingImages.filter(i => i.id !== id); }

  async onFileSelected(event: any) {
    const files: File[] = Array.from(event.target.files);
    const { cloudName, uploadPreset } = environment.cloudinary;
    this.uploadingImage = true;
    for (const file of files) {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'potikada/products');
      try {
        const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
        const data = await res.json();
        this.form.images.push(data.secure_url);
      } catch {
        this.popup = { type: 'error', title: 'Upload Failed', message: 'Image upload failed. Please try again.' };
      }
    }
    this.uploadingImage = false;
  }

  async onVariantImageSelected(event: any, index: number) {
    const file = event.target.files[0];
    if (!file) return;
    const { cloudName, uploadPreset } = environment.cloudinary;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'potikada/variants');
    try {
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      this.variants[index].image = data.secure_url;
    } catch {
      this.popup = { type: 'error', title: 'Upload Failed', message: 'Variant image upload failed.' };
    }
  }

  // ── Popup handlers ────────────────────────────
  onPopupConfirmed() {
    if (this.popup?.type === 'success') {
      this.router.navigate(['/admin/products']);
    }
    this.popup = null;
  }

  onPopupCancelled() {
    this.popup = null;
  }

  // ── Save ─────────────────────────────────────
  save() {
    if (!this.form.name || !this.form.price || !this.form.description) {
      this.popup = {
        type: 'warning',
        title: 'Missing Fields',
        message: 'Please fill in Product Name, Price and Description before saving.',
        confirmLabel: 'OK, Got It'
      };
      return;
    }
    if (this.form.images.length === 0 && this.existingImages.length === 0) {
      this.popup = {
        type: 'warning',
        title: 'No Image',
        message: 'Please add at least one product image before saving.',
        confirmLabel: 'OK, Got It'
      };
      return;
    }
    this.saving = true;
    const payload = {
      ...this.form,
      badge: this.form.badge || null,
      offer_tag: this.form.offer_tag || null,
      maker_name: this.form.maker_name || null,
      variants: this.variants,
      ...(this.deleteImageIds.length > 0 ? { delete_image_ids: this.deleteImageIds } : {})
    };
    const req = this.isEdit && this.productId
      ? this.apiService.updateProduct(this.productId, payload)
      : this.apiService.createProduct(payload);
    req.subscribe({
      next: () => {
        this.saving = false;
        this.popup = {
          type: 'success',
          title: this.isEdit ? 'Product Updated!' : 'Product Created!',
          message: this.isEdit
            ? 'Your product has been updated successfully.'
            : 'Your new product has been created and is now live.',
          confirmLabel: 'Go to Products →'
        };
      },
      error: (err) => {
        this.saving = false;
        this.popup = {
          type: 'error',
          title: 'Save Failed',
          message: err.error?.message || 'Something went wrong. Please try again.',
          confirmLabel: 'OK, Fix It'
        };
      }
    });
  }

  goBack() { this.router.navigate(['/admin/products']); }
}