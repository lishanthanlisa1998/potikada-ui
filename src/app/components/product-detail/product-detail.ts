import { CommonModule, NgTemplateOutlet } from '@angular/common';
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
  imports: [CommonModule, NgTemplateOutlet, RouterLink, BottomNav, SharePopup, EarnMoneyPopup, Header, Menu],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {

  product: any;
  productImages: string[] = [];
  families:      any[]    = [];
  variants:      any[]    = [];
  defaultVariant: any     = null;
  selections: { [familyName: string]: string } = {};

  selectedVariantPrice:  number | null = null;
  selectedVariantStock:  number | null = null;
  selectedVariantWeight: number | null = null;

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

  descSections: any[] = [];
  relatedProducts: any[] = [];

  constructor(
    private route:       ActivatedRoute,
    private router:      Router,
    private apiService:  Api,
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
        const p        = res.product ?? res;
        this.product   = this.formatProduct(p);
        const images   = p.images?.map((img: any) => img.image_url) ?? [];
        this.productImages = images;
        this.activeImage   = images[0] ?? '';

        this.families       = res.families        ?? [];
        this.variants       = res.variants        ?? [];
        this.defaultVariant = res.default_variant ?? null;

        // Init selections
        this.selections = {};
        this.families.forEach(f => this.selections[f.name] = '');

        if (this.defaultVariant?.attributes) {
          Object.entries(this.defaultVariant.attributes).forEach(([key, val]) => {
            this.selections[key] = val as string;
          });
          this.selectedVariantPrice  = this.defaultVariant.price        ?? null;
          this.selectedVariantStock  = this.defaultVariant.stock        ?? null;
          this.selectedVariantWeight = this.defaultVariant.weight_grams ?? null;
          if (this.defaultVariant.image) this.activeImage = this.defaultVariant.image;
        } else if (this.variants.length > 0) {
          const first = this.variants[0];
          if (first.attributes) {
            Object.entries(first.attributes).forEach(([key, val]) => {
              this.selections[key] = val as string;
            });
          }
          this.selectedVariantPrice  = first.price        ?? null;
          this.selectedVariantStock  = first.stock        ?? null;
          this.selectedVariantWeight = first.weight_grams ?? null;
          if (first.image) this.activeImage = first.image;
        }

        // Initial delivery calculation
        this.recalculateDelivery();
        this.parseDescription(p.description || '');
        this.isLiked = this.cartService.isInWishlist(p.id);
        this.loading = false;
        // Load related products
        if (this.product.category) {
          this.loadRelatedProducts(this.product.category, this.product.id);
          
        }

      },
      error: () => { this.error = true; this.loading = false; }
    });
  }

  loadRelatedProducts(category: string, currentId: number) {
    this.apiService.getProducts(category).subscribe({
      next: (products: any[]) => {
        this.relatedProducts = products
          .filter((p: any) => p.id !== currentId)
          .slice(0, 6);

          console.log("this.relatedProducts",this.relatedProducts)
      },
      error: () => { this.relatedProducts = []; }
    });
  }

  goToProduct(id: number) {
    this.router.navigate(['/product', id]);
    window.scrollTo(0, 0);
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

  // ── Variant Selection ──────────────────────────────────────────

  selectOption(familyName: string, value: string) {
    this.selections[familyName] = value;
    this.updateVariantCombo();
  }

  updateVariantCombo() {
    const match = this.variants.find((v: any) => {
      if (!v.attributes) return false;
      return Object.entries(this.selections).every(([key, val]) => {
        if (!val) return true;
        return v.attributes[key] === val;
      });
    });

    if (match) {
      this.selectedVariantPrice  = match.price        ?? null;
      this.selectedVariantStock  = match.stock        ?? 0;
      this.selectedVariantWeight = match.weight_grams ?? null;
      if (match.image) { this.activeImage = match.image; this.activeImageIndex = -1; }
    } else {
      this.selectedVariantPrice  = null;
      this.selectedVariantStock  = 0;
      this.selectedVariantWeight = null;
    }

    // Reset quantity to 1 when variant changes — avoid exceeding new stock
    this.quantity = 1;

    // Recalculate delivery with new variant weight
    this.recalculateDelivery();
  }

  // ── Delivery Calculation ──────────────────────────────────────

  recalculateDelivery() {
    const unitWeight  = this.selectedVariantWeight ?? this.product?.weight_grams ?? 0;
    const totalWeight = unitWeight * this.quantity;
    if (totalWeight > 0) {
      this.apiService.calculateShipping(totalWeight).subscribe({
        next:  (res: any) => { this.deliveryFee = res.delivery_fee ?? 0; },
        error: ()         => { this.deliveryFee = 300; }
      });
    }
  }

  // ── Amazon-style availability check ──────────────────────────

  isOptionUnavailable(familyName: string, value: string): boolean {
    const testSelections = { ...this.selections, [familyName]: value };
    const matching = this.variants.filter((v: any) => {
      if (!v.attributes) return false;
      return Object.entries(testSelections).every(([key, val]) => {
        if (!val) return true;
        return v.attributes[key] === val;
      });
    });
    if (matching.length === 0) return true;
    return matching.every((v: any) => v.stock === 0);
  }

  // ── Getters ───────────────────────────────────────────────────

  get currentPrice(): number {
    return this.selectedVariantPrice ?? this.product?.price ?? 0;
  }

  get currentStock(): number {
    return this.selectedVariantStock ?? this.product?.stock ?? 0;
  }

  get productTotal(): number {
    return this.currentPrice * this.quantity;
  }

  get grandTotal(): number {
    return this.productTotal + this.deliveryFee;
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

  // ── Quantity ──────────────────────────────────────────────────

  increaseQty() {
    if (this.quantity < this.currentStock) {
      this.quantity++;
      this.recalculateDelivery();
    }
  }

  decreaseQty() {
    if (this.quantity > 1) {
      this.quantity--;
      this.recalculateDelivery();
    }
  }

  // ── Image ─────────────────────────────────────────────────────

  switchImage(index: number) {
    this.activeImageIndex = index;
    this.activeImage = this.productImages[index];
  }

  // ── Wishlist ──────────────────────────────────────────────────

  toggleLike() {
    if (this.product) {
      this.cartService.toggleWishlist(this.product);
      this.isLiked = this.cartService.isInWishlist(this.product.id);
    }
  }

  // ── Cart ──────────────────────────────────────────────────────

  addToCart(event?: Event) {
    if (event) event.stopPropagation();
    if (!this.product || this.isOutOfStock) return;
    const variantLabel = Object.values(this.selections).filter(Boolean).join(' / ');
    this.cartService.addToCart(
      { ...this.product, price: this.currentPrice },
      variantLabel,
      this.quantity,
    );
    this.addedToCart = true;
    setTimeout(() => this.addedToCart = false, 2000);
  }

  buyNow() { this.addToCart(); this.router.navigate(['/cart']); }

  openSharePopup(event?: Event) {
    if (event) event.stopPropagation();
    this.sharePopupOpen = true;
  }

  // ── Description ───────────────────────────────────────────────

  parseDescription(raw: string) {
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) { this.descSections = parsed; return; }
    } catch {}
    this.descSections = [{ type: 'text', label: 'Description', content: raw }];
  }

  setTab(tab: 'description' | 'reviews' | 'qa') { this.activeTab = tab; }
  goBack() { window.history.back(); }
  heartsArray(n: number = 0): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < n);
  }
}