import { Component, EventEmitter, Output } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../../services/cart';

@Component({
  selector: 'app-bottom-nav',
  imports: [],
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.css',
})
export class BottomNav {
  @Output() earnMoneyClicked = new EventEmitter<void>();

  activeNav = 'allProducts';

  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  setNav(nav: string) {
    this.activeNav = nav;
  }

  openEarn() {
    this.earnMoneyClicked.emit();
  }
  goCart() { this.router.navigate(['/cart']); }
  goWishlist() { this.router.navigate(['/wishlist']); }

}
