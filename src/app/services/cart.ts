
import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product';

export interface CartItem {
  product: Product;
  quantity: number;
  size: string;
}

export interface WishlistItem {
  product: Product;
  
}


@Injectable({ providedIn: 'root' })
export class CartService {
  
  // ===== CART =====
  public cartItems = signal<CartItem[]>([]);
  private wishlistItems = signal<WishlistItem[]>([]);

  // Cart computed
  cart = this.cartItems.asReadonly();

  cartCount = computed(() =>
    this.cartItems().reduce((sum, item) => sum + item.quantity, 0)
  );

  cartSubtotal = computed(() =>
    this.cartItems().reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  );

  cartDelivery = computed(() =>
    this.cartItems().length > 0
      ? this.cartItems().reduce((sum, item) => sum + item.product.deliveryPrice, 0)
      : 0
  );

  cartTotal = computed(() => this.cartSubtotal() + this.cartDelivery());

  // Wishlist computed
  wishlist = this.wishlistItems.asReadonly();

  wishlistCount = computed(() => this.wishlistItems().length);

  // ===== CART METHODS =====
  addToCart(product: Product, size: string, quantity: number = 1) {
    const existing = this.cartItems().find(
      i => i.product.id === product.id && i.size === size
    );
    if (existing) {
      this.cartItems.update(items =>
        items.map(i =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      );
    } else {
      this.cartItems.update(items => [...items, { product, size, quantity }]);
    }
  }

  removeFromCart(productId: number, size: string) {
    this.cartItems.update(items =>
      items.filter(i => !(i.product.id === productId && i.size === size))
    );
  }

  updateQuantity(productId: number, size: string, quantity: number) {
    if (quantity < 1) {
      this.removeFromCart(productId, size);
      return;
    }
    this.cartItems.update(items =>
      items.map(i =>
        i.product.id === productId && i.size === size
          ? { ...i, quantity }
          : i
      )
    );
  }

  clearCart() {
    this.cartItems.set([]);
  }

  isInCart(productId: number): boolean {
    return this.cartItems().some(i => i.product.id === productId);
  }

  // ===== WISHLIST METHODS =====
  addToWishlist(product: Product) {
    if (!this.isInWishlist(product.id)) {
      this.wishlistItems.update(items => [...items, { product }]);
    }
  }

  removeFromWishlist(productId: number) {
    this.wishlistItems.update(items =>
      items.filter(i => i.product.id !== productId)
    );
  }

  toggleWishlist(product: Product) {
    this.isInWishlist(product.id)
      ? this.removeFromWishlist(product.id)
      : this.addToWishlist(product);
  }

  isInWishlist(productId: number): boolean {
    return this.wishlistItems().some(i => i.product.id === productId);
  }

  moveToCart(product: Product, size: string) {
    this.addToCart(product, size);
    this.removeFromWishlist(product.id);
  }
getWishlistTotal(): number {
  return this.wishlist().reduce((total, item) => total + item.product.price, 0);
}
  }