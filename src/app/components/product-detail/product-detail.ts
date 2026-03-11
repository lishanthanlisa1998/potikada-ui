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

  // Variants
  variants: any = { sizes: [], colors: [], designs: [] };
  selectedSize    = '';
  selectedColor   = '';
  selectedDesign  = '';
  selectedVariantPrice: number | null = null;
  selectedVariantStock: number | null = null;

  // Delivery
  deliveryFee = 0;

  loading = true;
  error   = false;

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
    private route:       ActivatedRoute,
    private router:      Router,
    private apiService:  Api,
    public  cartService: CartService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.loadProduct(+params['id']);
    });

    const ref = this.route.snapshot.queryParams['ref'];
    if (ref) localStorage.setItem('ref_code', ref);
  }

  loadProduct(id: number) {
    this.loading = true;
    this.error   = false;

    this.apiService.getProduct(id).subscribe({
      next: (res: any) => {
        const p          = res.product ?? res;
        this.product     = this.formatProduct(p);
        this.variants    = res.variants ?? { sizes: [], colors: [], designs: [] };

        // Images
        const images       = p.images?.map((img: any) => img.image_url) ?? [];
        this.productImages = images;
        this.activeImage   = images[0] ?? '';

        // Default selections
        const sizes = this.variants.sizes ?? [];
        if (sizes.length > 0) this.selectSize(sizes[0]);

        const colors = this.variants.colors ?? [];
        if (colors.length > 0) this.selectColor(colors[0]);

        const designs = this.variants.designs ?? [];
        if (designs.length > 0) this.selectDesign(designs[0]);

        // Calculate delivery fee based on product weight
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
      next: (res: any) => {
        this.deliveryFee = res.delivery_fee ?? 0;
      },
      error: () => {
        this.deliveryFee = 300; // fallback
      }
    });
  }

  // ===== VARIANT SELECTION =====
  selectSize(variant: any) {
    this.selectedSize = variant.size ?? variant;
    this.selectedVariantPrice = variant.price  ?? null;
    this.selectedVariantStock = variant.stock  ?? null;
    this.updateVariantCombo();
  }

  selectColor(variant: any) {
    this.selectedColor = variant.color;
    if (variant.image) this.activeImage = variant.image;
    this.updateVariantCombo();
  }

  selectDesign(variant: any) {
    this.selectedDesign = variant.design;
    if (variant.image) this.activeImage = variant.image;
    this.updateVariantCombo();
  }

  // When size+color+design all selected → find exact combo price/stock
  updateVariantCombo() {
    if (!this.selectedSize && !this.selectedColor && !this.selectedDesign) return;

    // Try to find exact matching variant
    const allVariants = [
      ...this.variants.sizes,
      ...this.variants.colors,
      ...this.variants.designs,
    ];

    // Find variant that matches all selected options
    const match = allVariants.find((v: any) => {
      const sizeMatch   = !this.selectedSize   || v.size   === this.selectedSize   || !v.size;
      const colorMatch  = !this.selectedColor  || v.color  === this.selectedColor  || !v.color;
      const designMatch = !this.selectedDesign || v.design === this.selectedDesign || !v.design;
      return sizeMatch && colorMatch && designMatch && (v.size || v.color || v.design);
    });

    if (match?.price) this.selectedVariantPrice = match.price;
    if (match?.stock !== undefined) this.selectedVariantStock = match.stock;
  }

  get currentPrice(): number {
    return this.selectedVariantPrice ?? this.product?.price ?? 0;
  }

  get currentStock(): number {
    return this.selectedVariantStock ?? this.product?.stock ?? 0;
  }

  get isOutOfStock(): boolean {
    return this.currentStock === 0;
  }

  get stockLabel(): string {
    if (this.currentStock === 0) return 'Out of stock';
    if (this.currentStock <= 5) return `Only ${this.currentStock} left!`;
    return `${this.currentStock} in stock`;
  }

  // ===== IMAGE =====
  switchImage(index: number) {
    this.activeImageIndex = index;
    this.activeImage = this.productImages[index];
  }

  // ===== QUANTITY =====
  increaseQty() {
    if (this.quantity < this.currentStock) this.quantity++;
  }
  decreaseQty() {
    if (this.quantity > 1) this.quantity--;
  }

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
    this.selectedSize,   // size
    this.quantity,       // quantity
    this.selectedColor,  // color
    this.selectedDesign  // design
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

  setTab(tab: 'description' | 'reviews' | 'qa') {
    this.activeTab = tab;
  }

  goBack() { window.history.back(); }

  heartsArray(n: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < n);
  }
}