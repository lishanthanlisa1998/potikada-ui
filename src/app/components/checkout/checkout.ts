import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart';
import { Api } from '../../services/api';

declare const payhere: any; 

@Component({
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
})

export class Checkout implements OnInit {


  cartItems:    any[] = [];
  cartSubtotal  = 0;
  cartDelivery  = 0;
  cartTotal     = 0;

  paymentMethod = 'card'; // 'card' | 'cod'
  loading       = false;
  error         = '';

  form = {
    first_name:    '',
    last_name:     '',
    email:         '',
    phone:         '',
    address:       '',
    city:          '',
    district:       '',
    affiliate_code: '',
  };

  constructor(
    private cartService: CartService,
    private apiService:  Api,
    private router:      Router
  ) {}

  ngOnInit() {
    this.cartItems   = this.cartService.cartItems();
    this.cartSubtotal= this.cartService.cartSubtotal();
    this.cartDelivery= this.cartService.cartDelivery();
    this.cartTotal   = this.cartService.cartTotal();

    if (this.cartItems.length === 0) {
      this.router.navigate(['/']);
    }

    // Load PayHere script
    this.loadPayHereScript();
  }

  loadPayHereScript() {
    if (document.getElementById('payhere-script')) return;
    const script    = document.createElement('script');
    script.id       = 'payhere-script';
    script.src      = 'https://www.payhere.lk/lib/payhere.js';
    script.async    = true;
    document.body.appendChild(script);
  }

  placeOrder() {
    if (!this.form.first_name || !this.form.last_name ||
        !this.form.email      || !this.form.phone     ||
        !this.form.address    || !this.form.city) {
      this.error = 'Please fill in all required fields.';
      return;
    }

    this.loading = true;
    this.error   = '';

    // Build order payload
    const orderPayload = {
      ...this.form,
      payment_method: this.paymentMethod,
      items: this.cartItems.map(item => ({
        product_id: item.product.id,
        size:       item.size,
        quantity:   item.quantity,
        price:      item.product.price,
      })),
      subtotal:      this.cartSubtotal,
      delivery_fee:  this.cartDelivery,
      total:         this.cartTotal,
    };

    this.apiService.createOrder(orderPayload).subscribe({
      next: (res) => {
        if (this.paymentMethod === 'cod') {
          // COD — go straight to success
          this.cartService.clearCart();
          this.router.navigate(['/order-success', res.order.id]);
        } else {
          // Card — initiate PayHere
          this.initiatePayHere(res.order.id);
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

        // PayHere payment object
        const payment = {
          sandbox:      paymentData.sandbox,
          merchant_id:  paymentData.merchant_id,
          return_url:   paymentData.return_url,
          cancel_url:   paymentData.cancel_url,
          notify_url:   paymentData.notify_url,
          order_id:     paymentData.order_id,
          items:        paymentData.items,
          amount:       paymentData.amount,
          currency:     paymentData.currency,
          first_name:   paymentData.first_name,
          last_name:    paymentData.last_name,
          email:        paymentData.email,
          phone:        paymentData.phone,
          address:      paymentData.address,
          city:         paymentData.city,
          country:      paymentData.country,
          hash:         paymentData.hash,
          district:     paymentData.district,
        };

        // PayHere callbacks
        payhere.onCompleted = (orderId: string) => {
          this.cartService.clearCart();
          this.router.navigate(['/order-success', orderId]);
        };

        payhere.onDismissed = () => {
          this.error = 'Payment was cancelled. You can try again.';
        };

        payhere.onError = (error: string) => {
          this.error = 'Payment error: ' + error;
        };

        // Open PayHere popup
        payhere.startPayment(payment);
      },
      error: (err) => {
        this.loading = false;
        this.error   = 'Could not initiate payment. Please try again.';
      }
    });
  }
}