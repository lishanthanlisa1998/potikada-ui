import { CommonModule } from '@angular/common';
import { Component, HostListener } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { Menu } from '../shared/menu/menu';
import { Header } from '../shared/header/header';
import { BottomNav } from '../shared/bottom-nav/bottom-nav';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, Header, Menu, BottomNav],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  menuOpen      = false;
  earnPopupOpen = false;
  hideHeader    = window.innerWidth > 726;

  @HostListener('window:resize')
  onResize() { this.hideHeader = window.innerWidth > 726; }

  constructor(
    public cartService: CartService,
    private router: Router
  ) {
    console.log("lisa");
  }

  openEarnPopup() { this.earnPopupOpen = true; }

  toggleCheck(item: CartItem) {
    this.cartService.toggleChecked(item.product.id, item.size, item.color, item.design);
  }

  increase(item: CartItem) {
    this.cartService.updateQuantity(item.product.id, item.size, item.quantity + 1, item.color, item.design);
  }

  decrease(item: CartItem) {
    this.cartService.updateQuantity(item.product.id, item.size, item.quantity - 1, item.color, item.design);
  }

  remove(item: CartItem) {
    this.cartService.removeFromCart(item.product.id, item.size, item.color, item.design);
  }

  goBack()   { this.router.navigate(['/']); }
  checkout() { this.router.navigate(['/checkout']); }
}