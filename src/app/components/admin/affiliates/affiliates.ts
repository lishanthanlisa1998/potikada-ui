import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Api } from '../../../services/api';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-affiliates',
  imports: [CommonModule,FormsModule],
  templateUrl: './affiliates.html',
  styleUrl: './affiliates.css',
})
export class Affiliates implements OnInit {

  affiliates: any[]  = [];
  filtered: any[]    = [];
  loading            = true;
  selectedAffiliate: any = null;
  affiliateDetail: any  = null;
  detailLoading         = false;
  payingId: number | null = null;
  payNote = '';
  searchTerm = '';

  constructor(private apiService: Api) {}

  ngOnInit() { this.loadAffiliates(); }

  loadAffiliates() {
    this.loading = true;
    this.apiService.getAdminAffiliates().subscribe({
      next: (res) => {
        this.affiliates = res;
        this.filtered   = res;
        this.loading    = false;
      },
      error: () => { this.loading = false; }
    });
  }

  search(event: any) {
    this.searchTerm = event.target.value.toLowerCase();
    this.filtered   = this.affiliates.filter(a =>
      a.name.toLowerCase().includes(this.searchTerm) ||
      a.email.toLowerCase().includes(this.searchTerm) ||
      a.affiliate_code.toLowerCase().includes(this.searchTerm)
    );
  }

  selectAffiliate(affiliate: any) {
    this.selectedAffiliate = affiliate;
    this.affiliateDetail   = null;
    this.detailLoading     = true;

    this.apiService.getAdminAffiliate(affiliate.id).subscribe({
      next: (res) => {
        this.affiliateDetail = res;
        this.detailLoading   = false;
      },
      error: () => { this.detailLoading = false; }
    });
  }

  closeDetail() {
    this.selectedAffiliate = null;
    this.affiliateDetail   = null;
  }

  openPay(withdrawalId: number) {
    this.payingId = withdrawalId;
    this.payNote  = '';
  }

  cancelPay() {
    this.payingId = null;
    this.payNote  = '';
  }

  confirmPay() {
    if (!this.payingId || !this.selectedAffiliate) return;

    this.apiService.markAffiliatePayment(
      this.selectedAffiliate.id,
      this.payingId,
      this.payNote
    ).subscribe({
      next: () => {
        // Update local state
        if (this.affiliateDetail?.pending_withdrawals) {
          this.affiliateDetail.pending_withdrawals =
            this.affiliateDetail.pending_withdrawals.filter(
              (w: any) => w.id !== this.payingId
            );
        }
        // Update balance in list
        const idx = this.affiliates.findIndex(
          a => a.id === this.selectedAffiliate.id
        );
        if (idx !== -1) {
          const paid = this.affiliateDetail?.pending_withdrawals
            ?.find((w: any) => w.id === this.payingId)?.amount || 0;
          this.affiliates[idx].pending_payout -= paid;
        }
        this.payingId = null;
        this.payNote  = '';
      },
      error: () => { this.payingId = null; }
    });
  }

  getStatusClass(status: string): string {
    const map: any = {
      pending:   'status-pending',
      confirmed: 'status-confirmed',
      unlocked:  'status-unlocked',
      paid:      'status-paid',
      cancelled: 'status-cancelled',
    };
    return map[status] || 'status-pending';
  }
}