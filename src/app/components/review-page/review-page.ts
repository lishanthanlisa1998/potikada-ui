import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Api } from '../../services/api';

@Component({
  selector: 'app-review-page',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './review-page.html',
  styleUrl:    './review-page.css',
})
export class ReviewPage implements OnInit {

  token     = '';
  orderData: any = null;
  loading   = true;
  error     = '';
  submitted = false;
  submitting = false;

  // ratings[productId] = { rating: 0, comment: '' }
  reviews: { [key: number]: { rating: number; comment: string } } = {};

  constructor(
    private route: ActivatedRoute,
    private api:   Api
  ) {}

  ngOnInit() {
    this.token = this.route.snapshot.queryParams['token'] ?? '';
    if (!this.token) {
      this.error   = 'Invalid review link.';
      this.loading = false;
      return;
    }
    this.loadReview();
  }

  loadReview() {
    this.api.getReview(this.token).subscribe({
      next: (res: any) => {
        this.orderData = res;
        // Init reviews map
        res.products.forEach((p: any) => {
          this.reviews[p.id] = { rating: 0, comment: '' };
        });
        this.loading = false;
      },
      error: (err: any) => {
        this.error   = err.error?.message || 'Invalid or expired review link.';
        this.loading = false;
      }
    });
  }

  getReview(productId: number) {
    if (!this.reviews[productId]) {
      this.reviews[productId] = { rating: 0, comment: '' };
    }
    return this.reviews[productId];
  }

  getProductRating(productId: number): number {
    return this.reviews[productId]?.rating ?? 0;
  }

  setRating(productId: number, star: number) {
    if (!this.reviews[productId]) {
      this.reviews[productId] = { rating: 0, comment: '' };
    }
    this.reviews[productId].rating = star;
  }

  getRatingLabel(rating: number): string {
    const labels: any = { 1: 'Poor', 2: 'Fair', 3: 'Good', 4: 'Very Good', 5: 'Excellent!' };
    return labels[rating] ?? '';
  }

  submitReview(productId: number) {
    const review = this.reviews[productId];
    if (!review || review.rating === 0) return;

    this.submitting = true;

    this.api.submitReview({
      token:      this.token,
      product_id: productId,
      rating:     review.rating,
      comment:    review.comment,
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.submitted  = true;
      },
      error: (err: any) => {
        this.submitting = false;
        this.error = err.error?.message || 'Failed to submit review. Please try again.';
      }
    });
  }
}
