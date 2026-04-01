import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Api } from '../../../services/api';
import { Header } from '../../shared/header/header';

@Component({
  selector: 'app-order-tracking',
  imports: [CommonModule, FormsModule,Header],
  templateUrl: './order-tracking.html',
  styleUrl:    './order-tracking.css',
})
export class OrderTracking {

  orderId = '';
  email   = '';
  loading = false;
  error   = '';
  order:  any = null;
  steps:  any[] = [];

  constructor(private api: Api) {}

  trackOrder() {
    if (!this.orderId.trim() || !this.email.trim()) {
      this.error = 'Please enter both Order ID and email.';
      return;
    }

    this.loading = true;
    this.error   = '';
    this.order   = null;
    this.steps   = [];

    this.api.trackOrder(this.orderId, this.email).subscribe({
      next: (res: any) => {
        this.order   = res.order;
        this.steps   = res.steps;
        this.loading = false;
      },
      error: (err: any) => {
        this.error   = err.error?.message || 'Order not found. Please check your details.';
        this.loading = false;
      }
    });
  }

  // Returns true for the first incomplete step (current step)
  isActiveStep(step: any): boolean {
    if (step.done) return false;
    return this.steps.find(s => !s.done) === step;
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      pending:    '⏳ Pending',
      confirmed:  '✅ Confirmed',
      processing: '📦 Processing',
      shipped:    '🚚 Shipped',
      delivered:  '🏠 Delivered',
      cancelled:  '❌ Cancelled',
    };
    return labels[status] ?? status;
  }
}