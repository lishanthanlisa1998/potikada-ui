import { Component, OnInit, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Api } from '../../../services/api';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-affiliate-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './affiliate-dashboard.html',
  styleUrl: './affiliate-dashboard.css',
})
export class AffiliateDashboard implements OnInit, AfterViewInit {

  loading = true;
  error   = '';

  // User info
  affiliateName = '';
  affiliateCode = '';
  affiliateId   = '';
  joinedDate    = '';
  affiliateLink = '';
  copied        = false;

  // Balances
  availableBalance = 0;
  pendingBalance   = 0;
  totalEarned      = 0;
  targetBalance    = 5000;
  earningsBarWidth = 0;

  // Stats
  totalClicks      = 0;
  pendingDelivery  = 0;
  inReturnPeriod   = 0;

  // Orders
  orders: any[] = [];

  // Breakdown
  breakdown: any[] = [];

  logicSteps = [
    { title: 'Customer Buys',          desc: 'Someone clicks your link and purchases' },
    { title: 'Order Delivered',         desc: 'Product reaches the customer successfully' },
    { title: '7-Day Return Window',     desc: 'Customer has 7 days to return the product' },
    { title: 'Commission Unlocked 💰',  desc: 'After return period ends, 7% is added to your balance' }
  ];

  constructor(
    private router: Router,
    private api: Api,
    private authService: Auth
  ) {}

  ngOnInit() {
    // Redirect if not logged in
    if (!this.authService.isAffiliateUser()) {
      this.router.navigate(['/affiliate/login']);
      return;
    }
    this.loadDashboard();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.earningsBarWidth = Math.min(
        Math.round((this.availableBalance / this.targetBalance) * 100),
        100
      );
    }, 400);
  }

  loadDashboard() {
    this.loading = true;
    this.api.affiliateDashboard().subscribe({
      next: (res: any) => {
        this.loading = false;

        // User info
        this.affiliateName = res.affiliate.name;
        this.affiliateCode = res.affiliate.affiliate_code;
        this.affiliateId   = 'PTK-' + String(res.affiliate.id).padStart(4, '0');
        this.joinedDate    = new Date(res.affiliate.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        this.affiliateLink = `potikada.lk/?ref=${res.affiliate.affiliate_code}`;

        // Balances
        this.availableBalance = res.affiliate.balance        || 0;
        this.pendingBalance   = res.affiliate.pending_balance || 0;
        this.totalEarned      = res.affiliate.total_earned   || 0;

        // Stats
        this.totalClicks     = res.stats?.total_clicks     || 0;
        this.pendingDelivery = res.stats?.pending_delivery || 0;
        this.inReturnPeriod  = res.stats?.in_return_period || 0;

        // Orders
        this.orders = res.recent_orders || [];

        // Breakdown
        this.breakdown = [
          {
            label:       'Confirmed Earnings',
            sub:         'Return period ended — ready to withdraw',
            amount:      this.availableBalance,
            color:       '#27AE60',
            amountColor: '#27AE60'
          },
          {
            label:       'Pending (In Return Period)',
            sub:         `${this.inReturnPeriod} orders — unlocks after 7 days`,
            amount:      this.pendingBalance,
            color:       '#F5A623',
            amountColor: '#F5A623'
          },
        ];

        // Update bar after data loads
        setTimeout(() => {
          this.earningsBarWidth = Math.min(
            Math.round((this.availableBalance / this.targetBalance) * 100),
            100
          );
        }, 400);
      },
      error: (err: any) => {
        this.loading = false;
        this.error   = 'Failed to load dashboard. Please try again.';
        // If unauthorized — redirect to login
        if (err.status === 401) {
          this.authService.affiliateLogout();
          this.router.navigate(['/affiliate/login']);
        }
      }
    });
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
    this.authService.affiliateLogout();
    this.router.navigate(['/affiliate/login']);
  }

  getStatusLabel(status: string): string {
    const map: any = {
      delivering: 'Delivering',
      returning:  'Return Period',
      completed:  'Confirmed'
    };
    return map[status] || status;
  }
}