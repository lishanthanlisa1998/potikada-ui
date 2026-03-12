import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Product } from '../../models/product';
import { ProductService } from '../../services/product';
import { BottomNav } from '../shared/bottom-nav/bottom-nav';
import { SharePopup } from '../shared/share-popup/share-popup';
import { EarnMoneyPopup } from '../shared/earn-money-popup/earn-money-popup';
import { Api } from '../../services/api';
import { CartService } from '../../services/cart';
import { Menu } from '../shared/menu/menu';
import { Header } from '../shared/header/header';


@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [
    CommonModule,BottomNav,SharePopup,EarnMoneyPopup,Menu,Header
  ],
  templateUrl: './product-list.html',
  styleUrl: './product-list.css'
})
export class ProductListComponent implements OnInit {


  filteredProducts: Product[] = [];
  activeFilter = 'all';
  filters: string[] = ['all'];

  likedIds = new Set<number>();
  cartCount = 0;

  earnPopupOpen = false;
  sharePopupOpen = false;
  menuOpen = false
  activeShareLink = '';

  products : Product[] = [];
  allProducts: any[] = [];

  addedToCart = false;

  slideIndex = 0;
  banners: any[] = [];
  private bannerInterval: any;
  bannerIndex = 0;
  private sliderInterval: any;
  slides = [];

  

  constructor(
    private router: Router,
    private productService: ProductService,
    private apiService: Api,
    public cartService: CartService
    
  ) {}

  ngOnInit() {
    this.loadBanners();
    this.loadProducts();
    this.startSlider();
    this.loadCategories();
    
    
  }
  loadCategories() {
  this.apiService.getCategories().subscribe({
    next: (cats) => {
      this.filters = ['all', ...cats.map(c => c.name)];
    },
    error: () => {
      // fallback to defaults
      this.filters = ['all', 'Books', 'Food', 'Oil'];
    }
  });
}

loadBanners() {
  this.apiService.getBanners().subscribe({
    next: (data) => {
      this.banners = data;
      this.startBannerSlider();
    },
    error: () => {}
  });
}

startBannerSlider() {
  if (this.banners.length > 1) {
    this.bannerInterval = setInterval(() => {
      this.bannerIndex = (this.bannerIndex + 1) % this.banners.length;
    }, 3000);
  }
}

goBannerSlide(i: number) {
  this.bannerIndex = i;
}


  openBanner(banner: any) {
    if (banner.link_url) {
      if (banner.open_new_tab) {
        window.open(banner.link_url, '_blank');
      } else {
        window.location.href = banner.link_url;
      }
    }
  }
  loadProducts() {
    this.apiService.getProducts('all').subscribe({
      next: (products: any) => {
        this.allProducts      = products;
        this.products         = products;
        this.filteredProducts = products;
      },
      error: (err: any) => {
        console.error('API error, using mock data', err);
        this.allProducts      = this.productService.getAll();
        this.products         = this.allProducts;
        this.filteredProducts = this.allProducts;
      }
    });
  }

setFilter(cat: string) {
  this.activeFilter = cat;
  console.log('Filter:', cat);
  console.log('Sample product category:', this.allProducts[0]?.category);
  
  this.filteredProducts = cat === 'all'
    ? [...this.allProducts]
    : this.allProducts.filter((p: any) => p.category === cat);
    
  console.log('Filtered count:', this.filteredProducts.length);
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

  toggleLike(event: Event, product: any) {
    if (event) event.stopPropagation();

     if (product) {
      this.cartService.toggleWishlist(product);
      this.likedIds.has(product.id)
      ? this.likedIds.delete(product.id)
      : this.likedIds.add(product.id);
      
      
      
    }
    
  }




  addToCart(event: Event, product: any) {
  if (event) event.stopPropagation();

  
  if (product) {
    this.cartService.addToCart(product, product.sizes?.[0] || '', 1);
    
  }
}



  isLiked(id: number): boolean {
    return this.likedIds.has(id);
  }

  



  goToProduct(id: number) {
    this.router.navigate(['/product', id]);
  }

  openEarnPopup() {
    this.earnPopupOpen = true;
  }
  goCart() { this.router.navigate(['/cart']); }
  goWishlist() { this.router.navigate(['/wishlist']); }



  openSharePopup(event: Event, link: string) {
    event.stopPropagation();
    const affiliate = localStorage.getItem('affiliate_user');

    if(affiliate){
      const user = JSON.parse(affiliate);
     
      this.activeShareLink = `${link}?ref=${user.affiliate_code}`;
      this.sharePopupOpen = true;

    }
    else{
      this.earnPopupOpen = true;
    }
    
    
  }

  heartsArray(n: number = 0): boolean[] {
  return Array.from({ length: 5 }, (_, i) => i < n);
}

}


