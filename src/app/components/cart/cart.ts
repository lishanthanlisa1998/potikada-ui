import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TopBanner } from '../shared/top-banner/top-banner';
import { CartService, CartItem } from '../../services/cart';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, TopBanner],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  increase(item: CartItem) {
    this.cartService.updateQuantity(item.product.id, item.size, item.quantity + 1);
  }

  decrease(item: CartItem) {
    this.cartService.updateQuantity(item.product.id, item.size, item.quantity - 1);
  }

  remove(item: CartItem) {
    this.cartService.removeFromCart(item.product.id, item.size);
  }

  goBack() {
    this.router.navigate(['/']);
  }

  checkout() {
    this.router.navigate(['/checkout']);
  }

}
