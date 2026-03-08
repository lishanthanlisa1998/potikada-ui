import { Component } from '@angular/core';
import { TopBanner } from '../shared/top-banner/top-banner';
import { SharePopup } from '../shared/share-popup/share-popup';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, WishlistItem } from '../../services/cart';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, RouterLink, TopBanner, SharePopup],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist {
sharePopupOpen = false;
  activeShareLink = '';
  selectedSize: { [productId: number]: string } = {};
  

  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  getSelectedSize(item: WishlistItem): string {
    return this.selectedSize[item.product.id] || item.product.sizes[0];
  }

  moveToCart(item: WishlistItem) {
    const size = this.getSelectedSize(item);
    this.cartService.moveToCart(item.product, size);
  }

  remove(item: WishlistItem) {
    this.cartService.removeFromWishlist(item.product.id);
  }

  openShare(event: Event, link: string) {
    event.stopPropagation();
    this.activeShareLink = link;
    this.sharePopupOpen = true;
  }

  goToProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  heartsArray(n: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < n);
  }
  
}