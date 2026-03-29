import { Component, EventEmitter, Output, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { CartService } from '../../../services/cart';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-bottom-nav',
  templateUrl: './bottom-nav.html',
  styleUrl: './bottom-nav.css',
})
export class BottomNav implements OnInit {

  @Output() earnMoneyClicked = new EventEmitter<void>();
  @Output() menuClicked = new EventEmitter<void>();

  activeNav = 'home';

  constructor(
    public cartService: CartService,
    private router: Router
  ) {}

  ngOnInit() {

    this.updateActive(this.router.url);

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.updateActive(event.urlAfterRedirects);
      });
  }

  updateActive(url: string) {

    if (url === '/') {
      this.activeNav = 'home';
    } 
    else if (url.includes('wishlist')) {
      this.activeNav = 'liked';
    } 
    else if (url.includes('cart')) {
      this.activeNav = 'cart';
    }
  }

  setNav(nav: string) {
    this.activeNav = nav;
  }

  gohome() {
    this.router.navigate(['/']);
  }

  goCart() {
    this.router.navigate(['/cart']);
  }

  goWishlist() {
    this.router.navigate(['/wishlist']);
  }

  openEarn() {
    this.earnMoneyClicked.emit();
  }

  openMenu() {
    this.menuClicked.emit();
  }
}