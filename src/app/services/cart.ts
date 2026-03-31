import { Injectable, signal, computed } from '@angular/core';
import { Product } from '../models/product';
import { Api } from './api';

export interface CartItem {
  product:  any;
  quantity: number;
  size:     string;
  color:    string;
  design:   string;
  weight:   number;
  checked:  boolean;
}

export interface WishlistItem {
  product: Product;
}

@Injectable({ providedIn: 'root' })
export class CartService {

  public cartItems      = signal<CartItem[]>([]);
  private wishlistItems = signal<WishlistItem[]>([]);
  public deliveryFee    = signal<number>(0);

  cart          = this.cartItems.asReadonly();
  cartCount     = computed(() => this.cartItems().reduce((s, i) => s + i.quantity, 0));

  // Only count CHECKED items
  cartSubtotal  = computed(() =>
    this.cartItems()
      .filter(i => i.checked)
      .reduce((s, i) => s + ((i.product.price || 0) * i.quantity), 0)
  );
  cartTotal    = computed(() => this.cartSubtotal() + this.deliveryFee());
  cartDelivery = computed(() => this.deliveryFee());

  // Total weight of CHECKED items only
  cartWeight = computed(() =>
    this.cartItems()
      .filter(i => i.checked)
      .reduce((sum, item) => {
        const w = item.weight || item.product.weight_grams || 0;
        return sum + (w * item.quantity);
      }, 0)
  );

  wishlist      = this.wishlistItems.asReadonly();
  wishlistCount = computed(() => this.wishlistItems().length);

  constructor(private api: Api) {}

  addToCart(product: any, size: string, quantity = 1, color = '', design = '') {
    const weight = product.weight_grams || product.weight || 0;

    // Match by product id + size (size contains full variant label e.g. "S / red")
    const existing = this.cartItems().find(i =>
      i.product.id === product.id && i.size === size
    );

    if (existing) {
      // Same product + same variant → just increase quantity
      this.cartItems.update(items =>
        items.map(i =>
          i.product.id === product.id && i.size === size
            ? { ...i, quantity: i.quantity + quantity }
            : i
        )
      );
    } else {
      // New item
      this.cartItems.update(items => [
        ...items,
        { product, size, quantity, color, design, weight, checked: true }
      ]);
    }

    this.recalculateDelivery();
  }

  // Toggle checked state of an item
  toggleChecked(productId: number, size: string, color = '', design = '') {
    this.cartItems.update(items =>
      items.map(i =>
        i.product.id === productId && i.size === size && i.color === color && i.design === design
          ? { ...i, checked: !i.checked }
          : i
      )
    );
    this.recalculateDelivery();
  }

  removeFromCart(productId: number, size: string, color = '', design = '') {
    this.cartItems.update(items =>
      items.filter(i => !(i.product.id === productId && i.size === size && i.color === color && i.design === design))
    );
    this.recalculateDelivery();
  }

  updateQuantity(productId: number, size: string, quantity: number, color = '', design = '') {
    if (quantity < 1) {
      this.removeFromCart(productId, size, color, design);
      return;
    }
    this.cartItems.update(items =>
      items.map(i =>
        i.product.id === productId && i.size === size && i.color === color && i.design === design
          ? { ...i, quantity }
          : i
      )
    );
    this.recalculateDelivery();
  }

  clearCart() {
    this.cartItems.set([]);
    this.deliveryFee.set(0);
  }

  isInCart(productId: number): boolean {
    return this.cartItems().some(i => i.product.id === productId);
  }

  recalculateDelivery() {
    // Sum weight of all CHECKED items
    // weight per item = (variant weight OR product weight_grams) × quantity
    const totalWeight = this.cartItems()
      .filter(i => i.checked)
      .reduce((sum, item) => {
        const unitWeight = item.weight || (item.product as any).weight_grams || 0;
        return sum + (unitWeight * item.quantity);
      }, 0);

    if (totalWeight === 0) {
      this.deliveryFee.set(199); // default when no weight data
      return;
    }

    this.api.calculateShipping(totalWeight).subscribe({
      next:  (res: any) => this.deliveryFee.set(res.delivery_fee ?? 300),
      error: ()         => this.deliveryFee.set(300),
    });
  }

  // Wishlist
  addToWishlist(product: Product)       { if (!this.isInWishlist(product.id)) this.wishlistItems.update(i => [...i, { product }]); }
  removeFromWishlist(productId: number) { this.wishlistItems.update(i => i.filter(x => x.product.id !== productId)); }
  toggleWishlist(product: Product)      { this.isInWishlist(product.id) ? this.removeFromWishlist(product.id) : this.addToWishlist(product); }
  isInWishlist(productId: number)       { return this.wishlistItems().some(i => i.product.id === productId); }
  moveToCart(product: Product, size: string) { this.addToCart(product, size); this.removeFromWishlist(product.id); }
  getWishlistTotal()                    { return this.wishlist().reduce((t, i) => t + i.product.price, 0); }
}