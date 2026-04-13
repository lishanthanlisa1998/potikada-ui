import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../../services/api';
import { Header } from '../../shared/header/header';

@Component({
  selector: 'app-order-tracking',
  imports: [CommonModule, FormsModule, Header],
  templateUrl: './order-tracking.html',
  styleUrl:    './order-tracking.css',
})
export class OrderTracking {

  email   = '';
  loading = false;
  error   = '';
  orders: any[] = [];
  expandedId: number | null = null;

  constructor(private api: Api) {}

  trackOrder() {
    if (!this.email.trim()) {
      this.error = 'Please enter your email address.';
      return;
    }

    this.loading = true;
    this.error   = '';
    this.orders  = [];

    this.api.trackOrder('', this.email).subscribe({
      next: (res: any) => {
        this.orders  = res.orders ?? [];
        this.loading = false;
        // Auto expand first order
        if (this.orders.length > 0) {
          this.expandedId = this.orders[0].id;
        }
      },
      error: (err: any) => {
        this.error   = err.error?.message || 'No orders found for this email.';
        this.loading = false;
      }
    });
  }

  toggleExpand(orderId: number) {
    this.expandedId = this.expandedId === orderId ? null : orderId;
  }

  isActiveStep(step: any, steps: any[]): boolean {
    if (step.done) return false;
    return steps.find(s => !s.done) === step;
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      pending:       '⏳ Pending',
      confirmed:     '✅ Confirmed',
      delivering:    '🚚 On the Way',
      delivered:     '🏠 Delivered',
      return_period: '↩️ Return Period',
      completed:     '🎉 Completed',
      cancelled:     '❌ Cancelled',
      returning:     '↩️ Returning',
    };
    return labels[status] ?? status;
  }

  getPaymentLabel(method: string): string {
    return method === 'cod' ? '💵 Cash on Delivery' : '💳 Card Payment';
  }

  getCourierLabel(method: string): string {
    return method === 'koombiyo' ? '🚀 Koombiyo Express' : '📮 Sri Lanka Post';
  }

  getPaymentStatusLabel(status: string): string {
    return status === 'paid' ? '✅ Paid' : '⏳ Pending';
  }
}
