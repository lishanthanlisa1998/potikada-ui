import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product';
import { TopBanner } from '../shared/top-banner/top-banner';
import { BottomNav } from '../shared/bottom-nav/bottom-nav';
import { SharePopup } from '../shared/share-popup/share-popup';
import { EarnMoneyPopup } from '../shared/earn-money-popup/earn-money-popup';
import { Api } from '../../services/api';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,TopBanner,BottomNav,SharePopup,EarnMoneyPopup
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {


  filteredProducts: Product[] = [];
  activeFilter = 'all';
  filters = ['all', 'Books', 'Food', 'Oil'];

  likedIds = new Set<number>();
  cartCount = 0;

  earnPopupOpen = false;
  sharePopupOpen = false;
  activeShareLink = '';

  products : Product[] = [];

  slideIndex = 0;
  slides = [
    { tag: '📚 New Release',  title: 'Neeye en Kaadhali',     img: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=200&q=80' },
    { tag: '🌿 100% Natural', title: 'Fresh Smoothie & Juice', img: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=200&q=80' },
    { tag: '🫙 Handmade',     title: 'Pure Village Oil',       img: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=200&q=80' },
  ];

  private sliderInterval: any;

  constructor(
    private router: Router,
    private productService: ProductService,
    private apiService: Api
  ) {}

  ngOnInit() {
    this.loadProducts();
    this.startSlider();
  }
  loadProducts(category: string = 'all') {
  this.apiService.getProducts(category).subscribe({
    next: (products) => {
      this.products = products;
      this.filteredProducts = products;
    },
    error: (err) => {
      console.error('API error, using mock data', err);
      // fallback to mock data
      this.products = this.productService.getAll();
      this.filteredProducts = this.products;
    }
  });
}

  setFilter(cat: string) {
    this.activeFilter = cat;
    this.loadProducts(cat);
  }

  ngOnDestroy() {
    clearInterval(this.sliderInterval);
  }



  startSlider() {
    this.sliderInterval = setInterval(() => {
      this.slideIndex = (this.slideIndex + 1) % this.slides.length;
    }, 4000);
  }

  goSlide(n: number) {
    this.slideIndex = n % this.slides.length;
  }

  toggleLike(event: Event, id: number) {
    event.stopPropagation();
    this.likedIds.has(id)
      ? this.likedIds.delete(id)
      : this.likedIds.add(id);
  }

  isLiked(id: number): boolean {
    return this.likedIds.has(id);
  }

  addToCart(event: Event, id: number) {
    event.stopPropagation();
    this.cartCount++;
  }

  goToProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  openEarnPopup() {
    this.earnPopupOpen = true;
  }

  openSharePopup(event: Event, link: string) {
    event.stopPropagation();
    this.activeShareLink = link;
    this.sharePopupOpen = true;
  }

  heartsArray(n: number): boolean[] {
    return Array.from({ length: 5 }, (_, i) => i < n);
  }
}