import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-reviews.html',
  styleUrl: './admin-reviews.css',
})
export class Reviews implements OnInit {

  reviews:      any[] = [];
  filtered:     any[] = [];
  loading       = true;
  activeFilter  = 'pending';
  processing: number | null = null;
  deleteReview: any = null;

  get pending() { return this.reviews.filter(r => !r.is_approved); }

  constructor(private api: Api) {}

  ngOnInit() { this.loadReviews(); }

  loadReviews() {
    this.loading = true;
    this.api.getAdminReviews().subscribe({
      next: (res: any) => {
        this.reviews = res;
        this.applyFilter();
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilter();
  }

  applyFilter() {
    if (this.activeFilter === 'pending')  this.filtered = this.reviews.filter(r => !r.is_approved);
    if (this.activeFilter === 'approved') this.filtered = this.reviews.filter(r => r.is_approved);
    if (this.activeFilter === 'all')      this.filtered = this.reviews;
  }

  approve(review: any) {
    this.processing = review.id;
    this.api.approveReview(review.id).subscribe({
      next: () => {
        review.is_approved = true;
        this.applyFilter();
        this.processing = null;
      },
      error: () => { this.processing = null; }
    });
  }

  confirmDelete(review: any) {
    this.deleteReview = review;
  }

  deleteConfirmed() {
    if (!this.deleteReview) return;
    this.processing = this.deleteReview.id;
    this.api.deleteReview(this.deleteReview.id).subscribe({
      next: () => {
        this.reviews = this.reviews.filter(r => r.id !== this.deleteReview.id);
        this.applyFilter();
        this.processing  = null;
        this.deleteReview = null;
      },
      error: () => { this.processing = null; }
    });
  }
}
