import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ProductService } from '../../services/product';
import { BottomNav } from '../shared/bottom-nav/bottom-nav';
import { SharePopup } from '../shared/share-popup/share-popup';
import { EarnMoneyPopup } from '../shared/earn-money-popup/earn-money-popup';
import { Api } from '../../services/api';
import { CartService } from '../../services/cart';
import { Menu } from '../shared/menu/menu';
import { Header } from '../shared/header/header';
import { CategoryDropdown } from '../shared/category-dropdown/category-dropdown';
import { SeoService } from '../../services/seo/seo-service';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNav, SharePopup, EarnMoneyPopup, Menu, Header, CategoryDropdown],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit, OnDestroy {

  filteredProducts: any[] = [];
  allProducts:      any[] = [];
  loading           = true;
  loadingMore       = false;
  hasMore           = true;
  page              = 1;
  perPage           = 12;

  categories:       string[] = [];
  searchQuery       = '';
  selectedCategory  = 'all';

  likedIds        = new Set<number>();
  earnPopupOpen   = false;
  sharePopupOpen  = false;
  menuOpen        = false;
  activeShareLink = '';

  banners: any[]  = [];
  bannerIndex     = 0;
  private bannerInterval: any;
  private sliderInterval: any;
  slides: any[]   = [];
  slideIndex      = 0;

  recentlyViewedIds: number[] = [];
  hasPersonalized   = false;

  private searchTimer: any;

  constructor(
    private router:         Router,
    private productService: ProductService,
    private apiService:     Api,
    public  cartService:    CartService,
    private seo: SeoService
  ) {}

  ngOnInit() {
    this.loadBanners();
    this.loadCategories();
    this.seo.setPage('Shop Sri Lankan Artisan Products',
      'Browse handmade products from local Sri Lankan makers on Potikada.');

    try {
      this.recentlyViewedIds = JSON.parse(
        localStorage.getItem('recently_viewed') || '[]'
      ).slice(0, 3);
    } catch { this.recentlyViewedIds = []; }

    this.loadProducts(true);
  }

  // ── Infinite scroll listener ────────────────────────────────
  @HostListener('window:scroll')
  onScroll() {
    if (this.loadingMore || !this.hasMore || this.loading) return;
    const scrollY    = window.scrollY || window.pageYOffset;
    const windowH    = window.innerHeight;
    const docH       = document.documentElement.scrollHeight;
    // Load more when 300px from bottom
    if (scrollY + windowH >= docH - 300) {
      this.loadMore();
    }
  }

  loadProducts(reset = false) {
    if (reset) {
      this.page            = 1;
      this.allProducts     = [];
      this.filteredProducts = [];
      this.hasMore         = true;
      this.loading         = true;
    }

    this.apiService.getProducts(this.selectedCategory, this.page, this.perPage, this.searchQuery).subscribe({
      next: (res: any) => {
        const products = res.data ?? res;
        this.hasMore   = res.has_more ?? false;

        if (reset) {
          this.allProducts = this.personalizeProducts(products);
        } else {
          this.allProducts = [...this.allProducts, ...products];
        }

        this.filteredProducts = this.allProducts;
        this.loading          = false;
        this.loadingMore      = false;
      },
      error: () => {
        if (reset) {
          this.allProducts      = this.productService.getAll();
          this.filteredProducts = this.allProducts;
        }
        this.loading     = false;
        this.loadingMore = false;
      }
    });
  }

  loadMore() {
    if (this.loadingMore || !this.hasMore) return;
    this.loadingMore = true;
    this.page++;
    this.loadProducts(false);
  }

  personalizeProducts(products: any[]): any[] {
    if (this.recentlyViewedIds.length === 0) return products;
    this.hasPersonalized = true;
    const recent = this.recentlyViewedIds
      .map(id => products.find((p: any) => p.id === id))
      .filter(Boolean);
    const others = products.filter((p: any) => !this.recentlyViewedIds.includes(p.id));
    return [...recent, ...others];
  }

  loadCategories() {
    this.apiService.getCategories().subscribe({
      next: (cats) => { this.categories = cats.map((c: any) => c.name); },
      error: ()     => { this.categories = ['Books', 'Food', 'Oil']; }
    });
  }

  loadBanners() {
    this.apiService.getBanners().subscribe({
      next: (data) => { this.banners = data; this.startBannerSlider(); },
      error: ()    => {}
    });
  }

  startBannerSlider() {
    if (this.banners.length > 1) {
      this.bannerInterval = setInterval(() => {
        this.bannerIndex = (this.bannerIndex + 1) % this.banners.length;
      }, 3000);
    }
  }

  goBannerSlide(i: number) { this.bannerIndex = i; }

  openBanner(banner: any) {
    if (banner.link_url) {
      banner.open_new_tab
        ? window.open(banner.link_url, '_blank')
        : window.location.href = banner.link_url;
    }
  }

  // Debounce search — wait 400ms before calling API
  onSearchChange() {
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => {
      if (this.searchQuery.trim()) {
        localStorage.setItem('last_search', this.searchQuery);
      }
      this.loadProducts(true);
    }, 400);
  }

  onCategoryChange(cat: any) {
    this.selectedCategory = cat;
    this.loadProducts(true);
  }

  clearSearch() {
    this.searchQuery = '';
    this.loadProducts(true);
  }

  formatSold(count: any): string {
    const n = parseInt(count) || 0;
    if (n === 0)   return '';
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k sold';
    return n + ' sold';
  }

  starsArray(rating: number | null): number[] {
    if (!rating) return [];
    return [1, 2, 3, 4, 5];
  }

  starFill(index: number, rating: number): 'full' | 'half' | 'empty' {
    if (rating >= index)       return 'full';
    if (rating >= index - 0.5) return 'half';
    return 'empty';
  }

toggleLike(event: Event, product: any) {
  event.stopPropagation();
  this.cartService.toggleWishlist(product);
}

  addToCart(event: Event, product: any) {
    event.stopPropagation();
    if (product) this.cartService.addToCart(product);
  }

  isLiked(id: number): boolean {  return this.cartService.isInWishlist(id); }

  goToProduct(id: number) {
    const recent: number[] = JSON.parse(localStorage.getItem('recently_viewed') || '[]');
    const updated = [id, ...recent.filter(i => i !== id)].slice(0, 3);
    localStorage.setItem('recently_viewed', JSON.stringify(updated));
    this.router.navigate(['/product', id]);
  }

  openEarnPopup() { this.earnPopupOpen = true; }

  openSharePopup(event: Event, link: string) {
    event.stopPropagation();
    const affiliate = localStorage.getItem('affiliate_user');
    if (affiliate) {
      const user = JSON.parse(affiliate);
      this.activeShareLink = `${link}?ref=${user.affiliate_code}`;
      this.sharePopupOpen  = true;
    } else {
      this.earnPopupOpen = true;
    }
  }

  startSlider() {
    this.sliderInterval = setInterval(() => {
      this.slideIndex = (this.slideIndex + 1) % this.slides.length;
    }, 4000);
  }

  ngOnDestroy() {
    clearInterval(this.sliderInterval);
    clearInterval(this.bannerInterval);
    clearTimeout(this.searchTimer);
  }
}
