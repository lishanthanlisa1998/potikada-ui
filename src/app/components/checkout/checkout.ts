import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { CartService } from '../../services/cart';
import { Api } from '../../services/api';
import { Header } from '../shared/header/header';
import { Menu } from '../shared/menu/menu';

declare const payhere: any;

const STORAGE_KEY = 'potikada_customer';

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule, Header, Menu, RouterLink],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})
export class Checkout implements OnInit {

  cartItems:    any[] = [];
  cartSubtotal  = 0;
  cartDelivery  = 0;
  cartTotal     = 0;
  menuOpen      = false;

  paymentMethod   = 'cod';
  loading         = false;
  error           = '';
  validationError = '';
  touched         = false;
  showSavePopup   = false;  // ask to save details
  hasSavedData    = false;  // already has saved data

  districts = [
    'Ampara','Anuradhapura','Badulla','Batticaloa','Colombo',
    'Galle','Gampaha','Hambantota','Jaffna','Kalutara',
    'Kandy','Kegalle','Kilinochchi','Kurunegala','Mannar',
    'Matale','Matara','Monaragala','Mullaitivu','Nuwara Eliya',
    'Polonnaruwa','Puttalam','Ratnapura','Trincomalee','Vavuniya'
  ];

  form = {
    first_name:     '',
    last_name:      '',
    email:          '',
    phone:          '',
    address:        '',
    city:           '',
    district:       '',
    affiliate_code: '',
  };

  constructor(
    private cartService: CartService,
    private apiService:  Api,
    private router:      Router
  ) {}

  ngOnInit() {
    this.cartItems    = this.cartService.cartItems().filter(i => i.checked);
    this.cartSubtotal = this.cartService.cartSubtotal();
    this.cartDelivery = this.cartService.cartDelivery();
    this.cartTotal    = this.cartService.cartTotal();

    if (this.cartItems.length === 0) this.router.navigate(['/']);

    const refCode = localStorage.getItem('ref_code');
    if (refCode) this.form.affiliate_code = refCode;

    // Auto-fill saved customer data
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.form = { ...this.form, ...data };
        this.hasSavedData = true;
      } catch {}
    }

    this.loadPayHereScript();
  }

  loadPayHereScript() {
    if (document.getElementById('payhere-script')) return;
    const script  = document.createElement('script');
    script.id     = 'payhere-script';
    script.src    = 'https://www.payhere.lk/lib/payhere.js';
    script.async  = true;
    document.body.appendChild(script);
  }

  // Called when user clicks Pay/Place Order
  placeOrder() {
    this.touched = true;

    if (!this.form.first_name.trim()) { this.validationError = 'Please enter your first name.'; return; }
    if (!this.form.last_name.trim())  { this.validationError = 'Please enter your last name.'; return; }
    if (!this.form.email.trim())      { this.validationError = 'Please enter your email address.'; return; }
    if (!this.form.phone.trim())      { this.validationError = 'Please enter your phone number.'; return; }
    if (!this.form.address.trim())    { this.validationError = 'Please enter your delivery address.'; return; }
    if (!this.form.city.trim())       { this.validationError = 'Please enter your city.'; return; }
    if (!this.form.district)          { this.validationError = 'Please select your district.'; return; }

    // If no saved data yet — ask to save
    if (!this.hasSavedData) {
      this.showSavePopup = true;
      return;
    }

    // Already has saved data — update it silently and proceed
    this.saveCustomerData();
    this.submitOrder();
  }

  // User responded to save popup
  onSaveChoice(save: boolean) {
    if (save) this.saveCustomerData();
    this.showSavePopup = false;
    this.submitOrder();
  }

  saveCustomerData() {
    const { affiliate_code, ...rest } = this.form;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(rest));
    this.hasSavedData = true;
  }

  clearSavedData() {
    localStorage.removeItem(STORAGE_KEY);
    this.hasSavedData = false;
  }

  // Actually place the order
  submitOrder() {
    this.loading = true;
    this.error   = '';

    const orderPayload = {
      ...this.form,
      payment_method: this.paymentMethod,
      items: this.cartItems.map(item => ({
        product_id: item.product.id,
        size:       item.size,
        quantity:   item.quantity,
        price:      item.product.price,
      })),
      subtotal:     this.cartSubtotal,
      delivery_fee: this.cartDelivery,
      total:        this.cartTotal,
    };

    this.apiService.createOrder(orderPayload).subscribe({
      next: (res) => {
        if (this.paymentMethod === 'cod') {
          this.cartService.clearCart();
          this.router.navigate(['/order-success', res.order_id]);
        } else {
          this.initiatePayHere(res.order_id);
        }
      },
      error: (err) => {
        this.loading = false;
        this.error   = err.error?.message || 'Something went wrong. Please try again.';
      }
    });
  }

  initiatePayHere(orderId: number) {
    this.apiService.initiatePayment(orderId).subscribe({
      next: (paymentData) => {
        this.loading = false;
        const payment = {
          sandbox:     paymentData.sandbox,
          merchant_id: paymentData.merchant_id,
          return_url:  paymentData.return_url,
          cancel_url:  paymentData.cancel_url,
          notify_url:  paymentData.notify_url,
          order_id:    paymentData.order_id,
          items:       paymentData.items,
          amount:      paymentData.amount,
          currency:    paymentData.currency,
          first_name:  paymentData.first_name,
          last_name:   paymentData.last_name,
          email:       paymentData.email,
          phone:       paymentData.phone,
          address:     paymentData.address,
          city:        paymentData.city,
          country:     paymentData.country,
          hash:        paymentData.hash,
        };

        payhere.onCompleted = (orderId: string) => {
          this.cartService.clearCart();
          this.router.navigate(['/order-success', orderId]);
        };
        payhere.onDismissed = () => { this.error = 'Payment was cancelled. You can try again.'; };
        payhere.onError     = (error: string) => { this.error = 'Payment error: ' + error; };

        payhere.startPayment(payment);
      },
      error: () => {
        this.loading = false;
        this.error   = 'Could not initiate payment. Please try again.';
      }
    });
  }
}