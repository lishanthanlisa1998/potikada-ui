import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

export interface StatCard {
  icon: string;
  label: string;
  value: string;
  sub: string;
  trend: string;
  trendType: 'up' | 'pending';
  iconClass: string;
  valueClass?: string;
}

export interface Order {
  id: string;
  product: string;
  date: string;
  price: number;
  status: 'delivering' | 'returning' | 'completed';
  icon: string;
}

export interface BreakdownItem {
  label: string;
  sub: string;
  amount: number;
  color: string;
  amountColor: string;
}
@Component({
  selector: 'app-affiliate-dashboard',
  imports: [CommonModule],
  templateUrl: './affiliate-dashboard.html',
  styleUrl: './affiliate-dashboard.css',
})
export class AffiliateDashboard implements OnInit, AfterViewInit {

  affiliateName = 'Lisa';
  affiliateId = 'PTK-2024-0042';
  joinedDate = 'January 2025';
  affiliateLink = 'potikada.com/?ref=lisa42';
  copied = false;

  availableBalance = 3200;
  pendingBalance = 1650;
  targetBalance = 5000;
  earningsBarWidth = 0;

  stats: StatCard[] = [
    {
      icon: '💰',
      label: 'Total Earned',
      value: 'Rs. 4,850',
      sub: 'Lifetime earnings',
      trend: '↑ +Rs. 650 this month',
      trendType: 'up',
      iconClass: 'gold',
      valueClass: 'gold-text'
    },
    {
      icon: '🔗',
      label: 'Link Clicks',
      value: '1,284',
      sub: 'Total clicks',
      trend: '↑ +84 this week',
      trendType: 'up',
      iconClass: 'blue'
    },
    {
      icon: '🚚',
      label: 'Pending Delivery',
      value: '6',
      sub: 'Orders in transit',
      trend: '⏳ Awaiting delivery',
      trendType: 'pending',
      iconClass: 'orange'
    },
    {
      icon: '🔄',
      label: 'Return Period',
      value: '3',
      sub: 'Orders in 7-day window',
      trend: '⏳ Period ends soon',
      trendType: 'pending',
      iconClass: 'green'
    }
  ];

  breakdown: BreakdownItem[] = [
    {
      label: 'Confirmed Earnings',
      sub: 'Return period ended — ready to withdraw',
      amount: 3200,
      color: '#27AE60',
      amountColor: '#27AE60'
    },
    {
      label: 'Pending (In Return Period)',
      sub: '3 orders — unlocks after 7 days',
      amount: 1050,
      color: '#F5A623',
      amountColor: '#F5A623'
    },
    {
      label: 'In Transit',
      sub: '6 orders — waiting for delivery',
      amount: 600,
      color: '#3B82F6',
      amountColor: '#3B82F6'
    }
  ];

  orders: Order[] = [
    {
      id: 'PTK-1042',
      product: 'Neeye en Kaadhali',
      date: 'Mar 5, 2025',
      price: 699,
      status: 'delivering',
      icon: '📦'
    },
    {
      id: 'PTK-1038',
      product: 'Potikada Natural Oil',
      date: 'Mar 1, 2025',
      price: 850,
      status: 'returning',
      icon: '🔄'
    },
    {
      id: 'PTK-1031',
      product: 'Herbal Tea Collection',
      date: 'Feb 22, 2025',
      price: 550,
      status: 'completed',
      icon: '✅'
    },
    {
      id: 'PTK-1025',
      product: 'Fresh Smoothie Pack',
      date: 'Feb 18, 2025',
      price: 450,
      status: 'completed',
      icon: '✅'
    }
  ];

  logicSteps = [
    { title: 'Customer Buys',        desc: 'Someone clicks your link and purchases' },
    { title: 'Order Delivered',       desc: 'Product reaches the customer successfully' },
    { title: '7-Day Return Window',   desc: 'Customer has 7 days to return the product' },
    { title: 'Commission Unlocked 💰', desc: 'After return period ends, 7% is added to your balance' }
  ];

  constructor(private router: Router) {}

  ngOnInit() {}

  ngAfterViewInit() {
    setTimeout(() => {
      this.earningsBarWidth = Math.round((this.availableBalance / this.targetBalance) * 100);
    }, 400);
  }

  copyLink() {
    navigator.clipboard.writeText(`https://${this.affiliateLink}`).catch(() => {});
    this.copied = true;
    setTimeout(() => this.copied = false, 2000);
  }

  shareOnWhatsApp() {
    const msg = encodeURIComponent(`Check out Potikada! 🛍️\nhttps://${this.affiliateLink}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
  }

  logout() {
    this.router.navigate(['/affiliate/login']);
  }

  getStatusLabel(status: string): string {
    const map: any = {
      delivering: 'Delivering',
      returning: 'Return Period',
      completed: 'Confirmed'
    };
    return map[status] || status;
  }
}