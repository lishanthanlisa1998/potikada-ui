import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CartService, CartItem } from '../../services/cart';
import { Api } from '../../services/api';
import { Menu } from '../shared/menu/menu';
import { Header } from '../shared/header/header';
import { BottomNav } from '../shared/bottom-nav/bottom-nav';

@Component({
  selector: 'app-cart',
  imports: [CommonModule, RouterLink, Header, Menu, BottomNav],
  templateUrl: './cart.html',
  styleUrl: './cart.css',
})
export class Cart implements OnInit {
  menuOpen      = false;
  earnPopupOpen = false;
  weightWarning = false;
  stockWarning  = false;
  hideHeader    = window.innerWidth > 726;

  // Courier
  courierMethod = 'koombiyo';
  koombiyoFee   = 0;
  slPostFee     = 0;
  cartDelivery  = 0;
  cartTotal     = 0;

  @HostListener('window:resize')
  onResize() { this.hideHeader = window.innerWidth > 726; }

  constructor(
    public cartService: CartService,
    private apiService: Api,
    private router: Router
  ) {}

  ngOnInit() {

    const saved = localStorage.getItem('selected_courier');
     if (saved) this.courierMethod = saved;

     
    const totalWeight    = this.cartService.cartWeight();
    this.koombiyoFee     = this.calcKoombiyo(totalWeight);
    this.cartDelivery    = this.koombiyoFee;
    this.updateTotal();

    // Get SL Post fee from API
    this.apiService.calculateShipping(totalWeight).subscribe({
      next:  (res: any) => { this.slPostFee = res.delivery_fee ?? 199; },
      error: ()         => { this.slPostFee = 199; }
    });
  }

  calcKoombiyo(weightGrams: number): number {
    const kg = weightGrams / 1000;
    if (kg <= 1) return 380;
    return 380 + (Math.ceil(kg - 1) * 50);
  }

  selectCourier(method: string) {
    this.courierMethod = method;
    this.cartDelivery  = method === 'koombiyo' ? this.koombiyoFee : this.slPostFee;
    this.updateTotal();
  }

  updateTotal() {
    this.cartTotal = this.cartService.cartSubtotal() + this.cartDelivery;
  }

  openEarnPopup() { this.earnPopupOpen = true; }

increase(item: CartItem) {
  const result = this.cartService.updateQuantity(
    item.product.id, item.size, item.quantity + 1, item.color, item.design
  );
  if (result === 'weight') this.weightWarning = true;
  if (result === 'stock')  this.stockWarning  = true;
  this.recalculateFees(); // ← change this
}

decrease(item: CartItem) {
  this.cartService.updateQuantity(
    item.product.id, item.size, item.quantity - 1, item.color, item.design
  );
  this.recalculateFees(); // ← change this
}

remove(item: CartItem) {
  this.cartService.removeFromCart(item.product.id, item.size, item.color, item.design);
  this.recalculateFees(); // ← change this
}

toggleCheck(item: CartItem) {
  this.cartService.toggleChecked(item.product.id, item.size, item.color, item.design);
  this.recalculateFees(); // ← change this
}

// ADD this new method:
recalculateFees() {
  const totalWeight = this.cartService.cartWeight();
  this.koombiyoFee  = this.calcKoombiyo(totalWeight);
  
  // Also refresh SL Post fee
  this.apiService.calculateShipping(totalWeight).subscribe({
    next:  (res: any) => { 
      this.slPostFee = res.delivery_fee ?? 199;
      // Update delivery if SL Post selected
      if (this.courierMethod === 'slpost') {
        this.cartDelivery = this.slPostFee;
      }
      this.updateTotal();
    },
    error: () => { this.slPostFee = 199; }
  });

  // Update delivery immediately for Koombiyo
  if (this.courierMethod === 'koombiyo') {
    this.cartDelivery = this.koombiyoFee;
    this.updateTotal();
  }
}
  goBack()   { this.router.navigate(['/']); }
  checkout() { this.router.navigate(['/checkout']); }
}
