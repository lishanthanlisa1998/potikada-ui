import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-orders',
  imports: [CommonModule],
  templateUrl: './orders.html',
  styleUrl: './orders.css',
})
export class Orders implements OnInit {

  orders: any[]   = [];
  filtered: any[] = [];
  loading         = true;
  activeStatus    = 'all';
  selectedOrder: any = null;
  updatingStatus  = false;

  statuses = [
    { key: 'all',           label: 'All' },
    { key: 'pending',       label: 'Pending' },
    { key: 'confirmed',     label: 'Confirmed' },
    { key: 'delivering',    label: 'Delivering' },
    { key: 'delivered',     label: 'Delivered' },
    { key: 'return_period', label: 'Return Period' },
    { key: 'completed',     label: 'Completed' },
    { key: 'returning',     label: 'Returning' },
    { key: 'returned',      label: 'Returned' },
  ];

  nextStatus: { [key: string]: string } = {
    pending:       'confirmed',
    confirmed:     'delivering',
    delivering:    'delivered',
    delivered:     'return_period',
    return_period: 'completed',
    returning:     'returned',
  };

  constructor(private apiService: Api) {}

  ngOnInit() { this.loadOrders(); }

  loadOrders() {
    this.loading = true;
    this.apiService.getAdminOrders().subscribe({
      next: (res) => {
        this.orders   = res;
        this.filtered = res;
        this.loading  = false;
      },
      error: () => { this.loading = false; }
    });
  }

  filterStatus(status: string) {
    this.activeStatus = status;
    this.filtered = status === 'all'
      ? this.orders
      : this.orders.filter(o => o.status === status);
  }
  countByStatus(status: string): number {
  return this.orders.filter(o => o.status === status).length;
}

  selectOrder(order: any) {
    this.selectedOrder = order;
  }

  closeOrder() {
    this.selectedOrder = null;
  }

  updateStatus(order: any, newStatus: string) {
    this.updatingStatus = true;
    this.apiService.updateOrderStatus(order.id, newStatus).subscribe({
      next: () => {
        // update in list
        const idx = this.orders.findIndex(o => o.id === order.id);
        if (idx !== -1) this.orders[idx].status = newStatus;
        const fidx = this.filtered.findIndex(o => o.id === order.id);
        if (fidx !== -1) this.filtered[fidx].status = newStatus;
        if (this.selectedOrder?.id === order.id) {
          this.selectedOrder.status = newStatus;
        }
        this.updatingStatus = false;
      },
      error: () => { this.updatingStatus = false; }
    });
  }

  getNext(status: string): string | null {
    return this.nextStatus[status] || null;
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

  markReturning(order: any) {
    this.updateStatus(order, 'returning');
  }
}