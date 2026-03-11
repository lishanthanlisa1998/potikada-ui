import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { Menu } from '../shared/menu/menu';
import { Header } from '../shared/header/header';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink,Header,Menu],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart {
  menuOpen = false ;
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
