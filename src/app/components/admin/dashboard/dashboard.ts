import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
stats: any = null;
  recentOrders: any[] = [];
  topProducts: any[] = [];
  loading = true;

  constructor(private apiService: Api) {}

  ngOnInit() {
    this.apiService.getAdminDashboard().subscribe({
      next: (res) => {
        this.stats         = res.stats;
        this.recentOrders  = res.recent_orders;
        this.topProducts   = res.top_products;
        this.loading       = false;
      },
      error: () => { this.loading = false; }
    });
  }

  getStatusClass(status: string): string {
    const map: any = {
      pending:       'status-pending',
      confirmed:     'status-confirmed',
      delivering:    'status-delivering',
      delivered:     'status-delivered',
      return_period: 'status-return',
      completed:     'status-completed',
      returning:     'status-returning',
      returned:      'status-returned',
    };
    return map[status] || 'status-pending';
  }
}
