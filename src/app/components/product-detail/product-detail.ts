import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { TopBanner } from '../shared/top-banner/top-banner';
import { BottomNav } from '../shared/bottom-nav/bottom-nav';
import { SharePopup } from '../shared/share-popup/share-popup';
import { EarnMoneyPopup } from '../shared/earn-money-popup/earn-money-popup';
import { ActivatedRoute, Router } from '@angular/router';
import { Product } from '../../models/product';
import { Api } from '../../services/api';
import { CartService } from '../../services/cart';

@Component({
  selector: 'app-product-detail',
  imports: [CommonModule,
    TopBanner,
    BottomNav,
    SharePopup,
    EarnMoneyPopup],
  templateUrl: './product-detail.html',
  styleUrl: './product-detail.css',
})
export class ProductDetail implements OnInit {

  product: Product | undefined;
  loading = true;
  error = false;

  activeImage = '';
  activeImageIndex = 0;
  selectedSize = '';
  quantity = 1;
  isLiked = false;
  activeTab: 'description' | 'reviews' | 'qa' = 'description';

  sharePopupOpen = false;
  earnPopupOpen = false;

  // Cart feedback
  addedToCart = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: Api,
    private cartService: CartService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      const id = +params['id'];
      this.loadProduct(id);
    });
  }

  loadProduct(id: number) {
    this.loading = true;
    this.error = false;

    // Get affiliate ref from URL if present
    const ref = this.route.snapshot.queryParams['ref'];

    this.apiService.getProduct(id, ref).subscribe({
      next: (product) => {
        this.product = product;
        this.activeImage = product.images[0];
        this.activeImageIndex = 0;
        this.selectedSize = product.sizes[1] || product.sizes[0];
        this.isLiked = this.cartService.isInWishlist(product.id);
        this.loading = false;
      },
      error: () => {
        this.error = true;
        this.loading = false;
      }
    });
  }

  switchImage(index: number) {
    if (this.product) {
      this.activeImageIndex = index;
      this.activeImage = this.product.images[index];
    }
  }

  selectSize(size: string) { this.selectedSize = size; }
  increaseQty() { this.quantity++; }
  decreaseQty() { if (this.quantity > 1) this.quantity--; }

  toggleLike() {
    if (this.product) {
      this.cartService.toggleWishlist(this.product);
      this.isLiked = this.cartService.isInWishlist(this.product.id);
    }
  }

  addToCart(event?: Event) {
    if (event) event.stopPropagation();
    if (this.product) {
      this.cartService.addToCart(this.product, this.selectedSize, this.quantity);
      this.addedToCart = true;
      setTimeout(() => this.addedToCart = false, 2000);
    }
  }

  buyNow() {
    if (this.product) {
      this.cartService.addToCart(this.product, this.selectedSize, this.quantity);
      this.router.navigate(['/cart']);
    }
  }

  openSharePopup(event?: Event) {
    if (event) event.stopPropagation();
    this.sharePopupOpen = true;
  }

  setTab(tab: 'description' | 'reviews' | 'qa') {
    this.activeTab = tab;
  }

  goBack() { this.router.navigate(['/']); }

  heartsArray(n: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < n);
  }
}