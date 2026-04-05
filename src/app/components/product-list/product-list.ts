import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
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
import { TopBanner } from '../shared/top-banner/top-banner';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, FormsModule, BottomNav, SharePopup, EarnMoneyPopup, Menu, Header, CategoryDropdown,TopBanner],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {

  filteredProducts: any[] = [];
  allProducts:      any[] = [];
  loading           = true;
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

  constructor(
    private router:         Router,
    private productService: ProductService,
    private apiService:     Api,
    public  cartService:    CartService
  ) {}

  ngOnInit() {
    this.loadBanners();
    this.loadProducts();
    this.loadCategories();
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

  loadProducts() {
    this.loading = true;
    this.apiService.getProducts('all').subscribe({
      next: (products: any) => {
        this.allProducts      = products;
        this.filteredProducts = products;
        this.loading          = false;
      },
      error: (err: any) => {
        this.allProducts      = this.productService.getAll();
        this.filteredProducts = this.allProducts;
        this.loading          = false;
      }
    });
  }

  applyFilters() {
    let result = [...this.allProducts];
    if (this.selectedCategory && this.selectedCategory !== 'all') {
      result = result.filter((p: any) => p.category === this.selectedCategory);
    }
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter((p: any) =>
        p.name.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.maker_name?.toLowerCase().includes(q)
      );
    }
    this.filteredProducts = result;
  }

  onSearchChange()          { this.applyFilters(); }
  onCategoryChange(cat: any) { this.selectedCategory = cat; this.applyFilters(); }

  clearSearch() { this.searchQuery = ''; this.applyFilters(); }

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
    this.likedIds.has(product.id)
      ? this.likedIds.delete(product.id)
      : this.likedIds.add(product.id);
  }

  addToCart(event: Event, product: any) {
    event.stopPropagation();
    if (product) this.cartService.addToCart(product);
  }

  isLiked(id: number): boolean { return this.likedIds.has(id); }
  goToProduct(id: number)      { this.router.navigate(['/product', id]); }
  openEarnPopup()              { this.earnPopupOpen = true; }

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
  }
}
