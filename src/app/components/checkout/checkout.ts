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
  courierMethod   = 'koombiyo'; // 'koombiyo' | 'slpost'
  loading         = false;
  error           = '';
  validationError = '';
  touched         = false;
  showSavePopup   = false;
  hasSavedData    = false;
  sameAsPhone     = false;
  showErrorPopup  = false;

  koombiyoFee = 0;
  slPostFee   = 0;

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
    whatsappNo:     ''
  };

  constructor(
    private cartService: CartService,
    private apiService:  Api,
    private router:      Router
  ) {}

ngOnInit() {
  this.cartItems    = this.cartService.cartItems().filter(i => i.checked);
  this.cartSubtotal = this.cartService.cartSubtotal();

  if (this.cartItems.length === 0) this.router.navigate(['/']);

  const refCode = localStorage.getItem('ref_code');
  if (refCode) this.form.affiliate_code = refCode;

  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const data = JSON.parse(saved);
      this.form = { ...this.form, ...data };
      this.hasSavedData = true;
    } catch {}
  }

  // Calculate delivery fees
  const totalWeight    = this.cartService.cartWeight();
  this.koombiyoFee     = this.calcKoombiyo(totalWeight);
  this.cartDelivery    = this.koombiyoFee; // default koombiyo
  this.updateTotal();

  // Get SL Post fee from API
  this.apiService.calculateShipping(totalWeight).subscribe({
    next:  (res: any) => {
      this.slPostFee = res.delivery_fee ?? 199;
    },
    error: () => { this.slPostFee = 199; }
  });

  this.loadPayHereScript();
}

  // Koombiyo: 1kg = Rs.380, each extra kg = +Rs.50
  calcKoombiyo(weightGrams: number): number {
    const kg = weightGrams / 1000;
    if (kg <= 0)  return 380;
    if (kg <= 1)  return 380;
    const extra = Math.ceil(kg - 1);
    return 380 + (extra * 50);
  }

  selectCourier(method: string) {
    this.courierMethod = method;
    this.cartDelivery  = method === 'koombiyo' ? this.koombiyoFee : this.slPostFee;
    this.updateTotal();
  }

  updateTotal() {
    this.cartTotal = this.cartSubtotal + this.cartDelivery;
  }

  loadPayHereScript() {
    if (document.getElementById('payhere-script')) return;
    const script  = document.createElement('script');
    script.id     = 'payhere-script';
    script.src    = 'https://www.payhere.lk/lib/payhere.js';
    script.async  = true;
    document.body.appendChild(script);
  }

  placeOrder() {
    this.touched = true;
    if (!this.form.first_name.trim()) { this.validationError = 'Please enter your first name.'; return; }
    if (!this.form.last_name.trim())  { this.validationError = 'Please enter your last name.'; return; }
    if (!this.form.email.trim())      { this.validationError = 'Please enter your email address.'; return; }
    if (!this.form.phone.trim())      { this.validationError = 'Please enter your phone number.'; return; }
    if (!this.form.address.trim())    { this.validationError = 'Please enter your delivery address.'; return; }
    if (!this.form.city.trim())       { this.validationError = 'Please enter your city.'; return; }
    if (!this.form.district)          { this.validationError = 'Please select your district.'; return; }
    if (!this.form.whatsappNo)        { this.validationError = 'Please enter your WhatsApp number.'; return; }

    if (!this.hasSavedData) {
      this.showSavePopup = true;
      return;
    }
    this.saveCustomerData();
    this.submitOrder();
  }

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

  onPhoneChange() {
    if (this.sameAsPhone) this.form.whatsappNo = this.form.phone;
  }

  onSameAsPhone() {
    this.form.whatsappNo = this.sameAsPhone ? this.form.phone : '';
  }

  submitOrder() {
    this.loading = true;
    this.error   = '';

    const orderPayload = {
      ...this.form,
      payment_method:  this.paymentMethod,
      delivery_method: this.courierMethod, // ← save courier
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
        this.loading        = false;
        this.error          = err.error?.message || 'Something went wrong. Please try again later.';
        this.showErrorPopup = true;
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
        payhere.onCompleted = (orderId: string) => { this.cartService.clearCart(); this.router.navigate(['/order-success', orderId]); };
        payhere.onDismissed = () => { this.error = 'Payment was cancelled. You can try again.'; };
        payhere.onError     = (error: string) => { this.error = 'Payment error: ' + error; };
        payhere.startPayment(payment);
      },
      error: () => { this.loading = false; this.error = 'Could not initiate payment. Please try again.'; }
    });
  }
}
