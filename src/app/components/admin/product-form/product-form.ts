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
    name: '', category: 'Books', price: null, original_price: null,
    badge: '', offer_tag: '', unit: '', maker_label: 'Author',
    maker_name: '', weight_grams: 0, delivery_price: 199,
    delivery_date: '', description: '', is_active: true,
    images: [] as string[],
  };

  categories  = ['Books', 'Food', 'Oil', 'Clothing', 'Other'];
  badges      = ['', 'Sale', 'New'];
  makerLabels = ['Author', 'Made by', 'Stitched by', 'Manufactured by', 'Packed by', 'Created by', 'Grown by'];

  // ── Variant Families ──────────────────────────────────────────
  availableFamilies: any[] = [];
  selectedFamilies: any[] = [];

  // ── Variants ──────────────────────────────────────────────────
  variants: any[] = [];

  newVariantSelections: { [key: string]: string } = {};
  newVariantPrice:       number | null = null;
  newVariantStock:       number = 0;
  newVariantWeight:      number = 0;
  newVariantImage:       string = '';

  // ── Images ────────────────────────────────────────────────────
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
    this.apiService.getVariantFamilies().subscribe({
      next: (families: any[]) => { this.availableFamilies = families; }
    });

    this.apiService.getCategories().subscribe({
      next: (cats: any[]) => { if (cats.length) this.categories = cats.map(c => c.name); }
    });

    const id = this.route.snapshot.params['id'];
    if (id) { this.isEdit = true; this.productId = +id; this.loadProduct(+id); }
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
        this.parseDescription(p.description || '');

        const apiFamilies = res.families || [];
        this.selectedFamilies = apiFamilies.map((f: any) => ({
          id:          f.id,
          name:        f.name,
          description: f.description,
          sort_order:  f.sort_order,
          options:     f.options.map((o: any) => o.value),
          newOption:   '',
        }));

        this.variants = (p.variants || []).map((v: any) => ({ ...v }));

        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.popup = { type: 'error', title: 'Load Failed', message: 'Could not load product. Please try again.' };
      }
    });
  }

  // ── Family Management ─────────────────────────────────────────

  get unselectedFamilies(): any[] {
    const selectedIds = this.selectedFamilies.map(f => f.id);
    return this.availableFamilies.filter(f => !selectedIds.includes(f.id));
  }

  addFamily(family: any) {
    if (this.selectedFamilies.find(f => f.id === family.id)) return;
    this.selectedFamilies.push({
      id:          family.id,
      name:        family.name,
      description: family.description,
      sort_order:  this.selectedFamilies.length,
      options:     [],
      newOption:   '',
    });
    this.resetNewVariantSelections();
  }

  removeFamily(familyId: number) {
    const family = this.selectedFamilies.find(f => f.id === familyId);
    if (!family) return;
    this.variants = this.variants.filter(v => !v.attributes?.[family.name]);
    this.selectedFamilies = this.selectedFamilies.filter(f => f.id !== familyId);
    this.resetNewVariantSelections();
  }

  // ── Option Management per Family ──────────────────────────────

  addOption(family: any) {
    const val = (family.newOption || '').trim();
    if (!val) return;
    if (family.options.includes(val)) return;
    family.options.push(val);
    family.newOption = '';
  }

  removeOption(family: any, value: string) {
    family.options = family.options.filter((o: string) => o !== value);
    this.variants = this.variants.filter(v => v.attributes?.[family.name] !== value);
  }

  // ── Variant Builder ───────────────────────────────────────────

  resetNewVariantSelections() {
    this.newVariantSelections = {};
    this.selectedFamilies.forEach(f => this.newVariantSelections[f.name] = '');
    this.newVariantPrice  = null;
    this.newVariantStock  = 0;
    this.newVariantWeight = 0;
    this.newVariantImage  = '';
  }

  addVariant() {
    const hasSelection = this.selectedFamilies.some(f => this.newVariantSelections[f.name]);
    if (!hasSelection) {
      this.popup = { type: 'warning', title: 'Select an Option', message: 'Please pick at least one option to add a variant.' };
      return;
    }

    const attributes: { [key: string]: string } = {};
    this.selectedFamilies.forEach(f => {
      if (this.newVariantSelections[f.name]) {
        attributes[f.name] = this.newVariantSelections[f.name];
      }
    });

    const isDup = this.variants.some(v => {
      return JSON.stringify(v.attributes) === JSON.stringify(attributes);
    });
    if (isDup) {
      this.popup = { type: 'warning', title: 'Duplicate!', message: 'This combination already exists.' };
      return;
    }

    const isFirst = this.variants.length === 0;
    this.variants.push({
      attributes,
      price:        this.newVariantPrice  ?? this.form.price,
      stock:        this.newVariantStock  || 0,
      weight_grams: this.newVariantWeight || this.form.weight_grams,
      image:        this.newVariantImage  || null,
      is_default:   isFirst,
    });

    this.resetNewVariantSelections();
  }

  removeVariant(index: number) {
    const wasDefault = this.variants[index].is_default;
    this.variants.splice(index, 1);
    if (wasDefault && this.variants.length > 0) this.variants[0].is_default = true;
  }

  setDefault(index: number) {
    this.variants.forEach((v, i) => v.is_default = i === index);
  }

  get noOptionsAdded(): boolean {
    return this.selectedFamilies.every(f => f.options.length === 0);
  }

  // ── Description Sections ──────────────────────────────────────
  descSections: any[] = [];

  addDescSection(type: 'text' | 'bullets' | 'image') {
    if (type === 'text')    this.descSections.push({ type: 'text',    label: 'About',    content: '' });
    if (type === 'bullets') this.descSections.push({ type: 'bullets', label: 'Features', items: [''] });
    if (type === 'image')   this.descSections.push({ type: 'image',   label: '',         url: '' });
  }

  removeDescSection(i: number) { this.descSections.splice(i, 1); }
  addBullet(section: any)      { section.items.push(''); }
  removeBullet(section: any, i: number) { section.items.splice(i, 1); }

  async onDescImageSelected(event: any, section: any) {
    const file = event.target.files[0];
    if (!file) return;
    const { cloudName, uploadPreset } = environment.cloudinary;
    const fd = new FormData();
    fd.append('file', file);
    fd.append('upload_preset', uploadPreset);
    fd.append('folder', 'potikada/descriptions');
    try {
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: fd });
      const data = await res.json();
      section.url = data.secure_url;
    } catch {
      this.popup = { type: 'error', title: 'Upload Failed', message: 'Image upload failed.' };
    }
  }

  getDescriptionPayload(): string {
    if (this.descSections.length === 0) return this.form.description || '';
    return JSON.stringify(this.descSections);
  }

  parseDescription(raw: string) {
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) { this.descSections = parsed; return; }
    } catch {}
    this.descSections = [{ type: 'text', label: 'Description', content: raw }];
  }

  variantLabel(v: any): string {
    if (!v.attributes) return 'Default';
    return Object.values(v.attributes).filter(Boolean).join(' / ');
  }

  // ── Images ────────────────────────────────────────────────────
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

  // ── Popup ─────────────────────────────────────────────────────
  onPopupConfirmed() {
    if (this.popup?.type === 'success') this.router.navigate(['/admin/products']);
    this.popup = null;
  }
  onPopupCancelled() { this.popup = null; }

  // ── Save ──────────────────────────────────────────────────────
  save() {
    // Validate name
    if (!this.form.name?.trim()) {
      this.popup = { type: 'warning', title: 'Missing Fields', message: 'Please fill in Product Name.', confirmLabel: 'OK' };
      return;
    }

    // Validate price — null, undefined, or empty string means not filled
    const priceValue = this.form.price;
    if (priceValue === null || priceValue === undefined || priceValue === '') {
      this.popup = { type: 'warning', title: 'Missing Fields', message: 'Please fill in a Price.', confirmLabel: 'OK' };
      return;
    }

    // Validate description — either sections or fallback text
    const hasDescription = this.descSections.length > 0 || !!this.form.description?.trim();
    if (!hasDescription) {
      this.popup = { type: 'warning', title: 'Missing Fields', message: 'Please add at least one Description section.', confirmLabel: 'OK' };
      return;
    }

    // Validate image
    if (this.form.images.length === 0 && this.existingImages.length === 0) {
      this.popup = { type: 'warning', title: 'No Image', message: 'Please add at least one product image.', confirmLabel: 'OK' };
      return;
    }

    this.saving = true;

    const familiesPayload = this.selectedFamilies.map((f, idx) => ({
      family_id:  f.id,
      sort_order: idx,
      options:    f.options,
    }));

    const payload = {
      ...this.form,
      description: this.getDescriptionPayload(),
      badge:      this.form.badge     || null,
      offer_tag:  this.form.offer_tag || null,
      maker_name: this.form.maker_name || null,
      families:   familiesPayload,
      variants:   this.variants,
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
          message: this.isEdit ? 'Product updated successfully.' : 'Product created and is now live.',
          confirmLabel: 'Go to Products →'
        };
      },
      error: (err) => {
        this.saving = false;
        this.popup = { type: 'error', title: 'Save Failed', message: err.error?.message || 'Something went wrong.', confirmLabel: 'OK' };
      }
    });
  }

  goBack() { this.router.navigate(['/admin/products']); }
}