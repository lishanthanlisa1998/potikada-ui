import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { BottomNav } from '../shared/bottom-nav/bottom-nav';
import { SharePopup } from '../shared/share-popup/share-popup';
import { EarnMoneyPopup } from '../shared/earn-money-popup/earn-money-popup';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Api } from '../../services/api';
import { CartService } from '../../services/cart';
import { Header } from '../shared/header/header';
import { Menu } from '../shared/menu/menu';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, BottomNav, SharePopup, EarnMoneyPopup, Header, Menu],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {

  product: any;
  productImages: string[] = [];

  // Flat combo variants from API
  variants: any[]    = [];
  sizes:    string[] = [];
  colors:   any[]    = [];   // [{color, color_hex}]
  designs:  string[] = [];
  defaultVariant: any = null;

  selectedSize   = '';
  selectedColor  = '';
  selectedDesign = '';
  selectedVariantPrice: number | null = null;
  selectedVariantStock: number | null = null;

  deliveryFee = 0;
  loading     = true;
  error       = false;

  activeImage      = '';
  activeImageIndex = 0;
  quantity         = 1;
  isLiked          = false;
  addedToCart      = false;
  activeTab: 'description' | 'reviews' | 'qa' = 'description';

  sharePopupOpen = false;
  earnPopupOpen  = false;
  menuOpen       = false;

  constructor(
    private route:      ActivatedRoute,
    private router:     Router,
    private apiService: Api,
    public  cartService: CartService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => this.loadProduct(+params['id']));
    const ref = this.route.snapshot.queryParams['ref'];
    if (ref) localStorage.setItem('ref_code', ref);
  }

  loadProduct(id: number) {
    this.loading = true;
    this.error   = false;

    this.apiService.getProduct(id).subscribe({
      next: (res: any) => {
        const p = res.product ?? res;
        this.product = this.formatProduct(p);

        // Images
        const images       = p.images?.map((img: any) => img.image_url) ?? [];
        this.productImages = images;
        this.activeImage   = images[0] ?? '';

        // Flat variants + unique option lists
        this.variants       = res.variants        ?? [];
        this.sizes          = res.sizes           ?? [];
        this.colors         = res.colors          ?? [];
        this.designs        = res.designs         ?? [];
        this.defaultVariant = res.default_variant ?? null;

        // Apply default variant
        if (this.defaultVariant) {
          this.selectedSize             = this.defaultVariant.size   ?? '';
          this.selectedColor            = this.defaultVariant.color  ?? '';
          this.selectedDesign           = this.defaultVariant.design ?? '';
          this.selectedVariantPrice     = this.defaultVariant.price  ?? null;
          this.selectedVariantStock     = this.defaultVariant.stock  ?? null;
          if (this.defaultVariant.image) this.activeImage = this.defaultVariant.image;
        } else if (this.variants.length > 0) {
          const first = this.variants[0];
          this.selectedSize             = first.size   ?? '';
          this.selectedColor            = first.color  ?? '';
          this.selectedDesign           = first.design ?? '';
          this.selectedVariantPrice     = first.price  ?? null;
          this.selectedVariantStock     = first.stock  ?? null;
        }

        // Delivery fee
        const weight = p.weight_grams ?? 0;
        if (weight > 0) this.calculateDelivery(weight);

        this.isLiked = this.cartService.isInWishlist(p.id);
        this.loading = false;
      },
      error: () => {
        this.error   = true;
        this.loading = false;
      }
    });
  }

  formatProduct(p: any): any {
    const images = p.images?.map((img: any) => img.image_url) ?? [];
    return {
      id:            p.id,
      name:          p.name,
      category:      p.category,
      image:         images[0] ?? '',
      images:        images,
      price:         p.price,
      originalPrice: p.original_price,
      badge:         p.badge,
      offerTag:      p.offer_tag,
      hearts:        p.hearts ?? 0,
      shareLink:     p.share_link,
      unit:          p.unit,
      maker_label:   p.maker_label ?? null,
      maker_name:    p.maker_name  ?? null,
      weight_grams:  p.weight_grams ?? 0,
      stock:         p.stock ?? 0,
      deliveryPrice: p.delivery_price,
      deliveryDate:  p.delivery_date,
      description:   p.description,
    };
  }

  calculateDelivery(weightGrams: number) {
    this.apiService.calculateShipping(weightGrams).subscribe({
      next:  (res: any) => { this.deliveryFee = res.delivery_fee ?? 0; },
      error: ()         => { this.deliveryFee = 300; }
    });
  }

  // ===== VARIANT SELECTION =====
  selectSize(size: string) {
    this.selectedSize = size;
    this.updateVariantCombo();
  }

  selectColor(c: any) {
    this.selectedColor = c.color;
    this.updateVariantCombo();
  }

  selectDesign(design: string) {
    this.selectedDesign = design;
    this.updateVariantCombo();
  }

  updateVariantCombo() {
    const match = this.variants.find((v: any) => {
      const sizeOk   = !v.size   || !this.selectedSize   || v.size   === this.selectedSize;
      const colorOk  = !v.color  || !this.selectedColor  || v.color  === this.selectedColor;
      const designOk = !v.design || !this.selectedDesign || v.design === this.selectedDesign;
      return sizeOk && colorOk && designOk;
    });

    if (match) {
      this.selectedVariantPrice = match.price ?? null;
      this.selectedVariantStock = match.stock ?? 0;
      if (match.image) this.activeImage = match.image;
    }
  }

  // All combos for a size out of stock?
  isSizeOutOfStock(size: string): boolean {
    const combos = this.variants.filter((v: any) => v.size === size);
    if (combos.length === 0) return false;
    return combos.every((v: any) => v.stock === 0);
  }

  // All combos for a color (with current size) out of stock?
  isColorOutOfStock(color: string): boolean {
    const combos = this.variants.filter((v: any) =>
      v.color === color && (!this.selectedSize || v.size === this.selectedSize)
    );
    if (combos.length === 0) return false;
    return combos.every((v: any) => v.stock === 0);
  }

  get currentPrice(): number {
    return this.selectedVariantPrice ?? this.product?.price ?? 0;
  }

  get currentStock(): number {
    return this.selectedVariantStock ?? this.product?.stock ?? 0;
  }

  get isOutOfStock(): boolean {
    return this.variants.length > 0 && this.currentStock === 0;
  }

  get stockLabel(): string {
    if (this.variants.length === 0) return '';
    if (this.currentStock === 0)    return '😔 Out of stock';
    if (this.currentStock <= 5)     return `🔥 Only ${this.currentStock} left!`;
    return `✅ ${this.currentStock} in stock`;
  }

  // ===== IMAGE =====
  switchImage(index: number) {
    this.activeImageIndex = index;
    this.activeImage = this.productImages[index];
  }

  // ===== QUANTITY =====
  increaseQty() { if (this.quantity < this.currentStock) this.quantity++; }
  decreaseQty() { if (this.quantity > 1) this.quantity--; }

  // ===== WISHLIST =====
  toggleLike() {
    if (this.product) {
      this.cartService.toggleWishlist(this.product);
      this.isLiked = this.cartService.isInWishlist(this.product.id);
    }
  }

  // ===== CART =====
  addToCart(event?: Event) {
    if (event) event.stopPropagation();
    if (!this.product || this.isOutOfStock) return;

    this.cartService.addToCart(
      { ...this.product, price: this.currentPrice },
      this.selectedSize,
      this.quantity,
      this.selectedColor,
      this.selectedDesign
    );
    this.addedToCart = true;
    setTimeout(() => this.addedToCart = false, 2000);
  }

  buyNow() {
    this.addToCart();
    this.router.navigate(['/cart']);
  }

  openSharePopup(event?: Event) {
    if (event) event.stopPropagation();
    this.sharePopupOpen = true;
  }

  setTab(tab: 'description' | 'reviews' | 'qa') { this.activeTab = tab; }
  goBack() { window.history.back(); }
  heartsArray(n: number = 0): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < n);
  }
}