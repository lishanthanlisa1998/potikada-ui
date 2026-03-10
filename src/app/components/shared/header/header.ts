import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../services/cart';

@Component({
  selector: 'app-header',
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {

@Input() showBack    = false;
  @Input() title       = '';
  @Input() showCart    = true;
  @Input() showWishlist = true;
  @Input() showMenu    = true;

  @Output() menuClicked = new EventEmitter<void>();
  @Output() backClicked = new EventEmitter<void>();

  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  goBack() {
    if (this.backClicked.observers.length > 0) {
      this.backClicked.emit();
    } else {
      window.history.back();
    }
  }

  goCart()     { this.router.navigate(['/cart']); }
  goWishlist() { this.router.navigate(['/wishlist']); }
}