import { Component, HostListener } from '@angular/core';
import { SharePopup } from '../shared/share-popup/share-popup';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { CartService, WishlistItem } from '../../services/cart';
import { Menu } from '../shared/menu/menu';
import { Header } from '../shared/header/header';
import { BottomNav } from '../shared/bottom-nav/bottom-nav';

@Component({
  selector: 'app-wishlist',
  imports: [CommonModule, RouterLink, SharePopup, Menu, Header, BottomNav],
  templateUrl: './wishlist.html',
  styleUrl: './wishlist.css',
})
export class Wishlist {
  sharePopupOpen  = false;
  activeShareLink = '';
  earnPopupOpen   = false;
  menuOpen        = false;
  hideHeader      = window.innerWidth > 727;

  @HostListener('window:resize')
  onResize() { this.hideHeader = window.innerWidth > 727; }

  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(){
    console.log(this.cartService.wishlist());
  }

  openEarnPopup() { this.earnPopupOpen = true; }

  // Go to product page — user selects variant there
  moveToCart(item: WishlistItem) {
    this.router.navigate(['/product', item.product.id]);
  }

  remove(item: WishlistItem) {
    this.cartService.removeFromWishlist(item.product.id);
  }

  openShare(event: Event, productId: number) {
    event.stopPropagation();
    const affiliate = localStorage.getItem('affiliate_user');
    if (affiliate) {
      const user = JSON.parse(affiliate);
      this.activeShareLink = `https://potikada.lk/product/${productId}?ref=${user.affiliate_code}`;
    } else {
      this.activeShareLink = `https://potikada.lk/product/${productId}`;
    }
    this.sharePopupOpen = true;
  }

  goToProduct(id: number) { this.router.navigate(['/product', id]); }
  goBack()                 { this.router.navigate(['/']); }

  heartsArray(n: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < n);
  }
}
