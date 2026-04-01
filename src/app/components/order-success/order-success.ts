import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Api } from '../../services/api';
import { Header } from '../shared/header/header';

@Component({
  selector: 'app-order-success',
  imports: [CommonModule, RouterLink,Header],
  templateUrl: './order-success.html',
  styleUrl: './order-success.css',
})
export class OrderSuccess implements OnInit {

  orderId: number | null = null;
  order:   any           = null;
  payment: any           = null;
  loading                = true;
  pollCount              = 0;

  constructor(
    private route:      ActivatedRoute,
    private apiService: Api
  ) {}

  ngOnInit() {
    this.orderId = +this.route.snapshot.params['id'];
    this.pollPaymentStatus();
  }

  pollPaymentStatus() {
    if (!this.orderId) return;

    this.apiService.checkPaymentStatus(this.orderId).subscribe({
      next: (res) => {
        console.log("res",res);
        this.order   = res;
        this.payment = res.payment;
        this.loading = false;

        // Poll until confirmed (max 10 times)
        if (res.payment_status === 'pending' && this.pollCount < 10) {
          this.pollCount++;
          setTimeout(() => this.pollPaymentStatus(), 3000);
        }
      },
      error: () => { this.loading = false; }
    });
  }

  getStatusIcon(): string {
    if (!this.payment) return '📦';
    const s = this.payment.status;
    if (s === 'completed') return '✅';
    if (s === 'pending')   return '⏳';
    if (s === 'failed')    return '❌';
    if (s === 'cancelled') return '🚫';
    return '📦';
  }
}