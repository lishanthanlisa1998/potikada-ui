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
  variantId: string;
  stock:    number; // ← add stock tracking
}

export interface WishlistItem {
  product: Product;
}

const MAX_WEIGHT_GRAMS = 25000; // 25kg

@Injectable({ providedIn: 'root' })
export class CartService {

  public cartItems      = signal<CartItem[]>([]);
  private wishlistItems = signal<WishlistItem[]>([]);
  public deliveryFee    = signal<number>(0);

  cart          = this.cartItems.asReadonly();
  cartCount     = computed(() => this.cartItems().reduce((s, i) => s + i.quantity, 0));

  cartSubtotal  = computed(() =>
    this.cartItems()
      .filter(i => i.checked)
      .reduce((s, i) => s + ((i.product.price || 0) * i.quantity), 0)
  );
  cartTotal    = computed(() => this.cartSubtotal() + this.deliveryFee());
  cartDelivery = computed(() => this.deliveryFee());

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

  // Returns: null = success, 'stock' = exceeded stock, 'weight' = exceeded weight
  addToCart(product: any, size: any = '', quantity = 1, color: any = '', design: any = ''): string | null {
    const normalizedSize   = String(size   ?? '').trim();
    const normalizedColor  = String(color  ?? '').trim();
    const normalizedDesign = String(design ?? '').trim();

    const variantId  = product.default_variant?.id ?? null;
    const itemWeight = product.default_variant?.weight_grams ?? product.weight_grams ?? product.weight ?? 0;
   
    const itemStock = product.stock ?? product.default_variant?.stock ?? 9999;

    const existing = this.cartItems().find(i =>
      i.product.id === product.id &&
      (i.variantId ?? null) === variantId &&
      (i.size   ?? '') === normalizedSize &&
      (i.color  ?? '') === normalizedColor &&
      (i.design ?? '') === normalizedDesign
    );

    const currentQty = existing?.quantity ?? 0;
    const newQty     = currentQty + quantity;

    // Stock check
    if (newQty > itemStock) return 'stock';

    // Weight check — total cart weight
    const addedWeight       = itemWeight * quantity;
    const currentCartWeight = this.cartWeight();
    if (currentCartWeight + addedWeight > MAX_WEIGHT_GRAMS) return 'weight';

    if (existing) {
      this.cartItems.update(items =>
        items.map(i =>
          i.product.id === product.id &&
          (i.variantId ?? null) === variantId &&
          (i.size   ?? '') === normalizedSize &&
          (i.color  ?? '') === normalizedColor &&
          (i.design ?? '') === normalizedDesign
            ? { ...i, quantity: newQty }
            : i
        )
      );
    } else {
      this.cartItems.update(items => [
        ...items,
        {
          product,
          variantId,
          size:    normalizedSize,
          quantity,
          color:   normalizedColor,
          design:  normalizedDesign,
          weight:  itemWeight,
          stock:   itemStock,
          checked: true,
        }
      ]);
    }

    this.recalculateDelivery();
    return null; // success
  }

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

  // Returns error string or null
  updateQuantity(productId: number, size: string, quantity: number, color = '', design = ''): string | null {
    if (quantity < 1) {
      this.removeFromCart(productId, size, color, design);
      return null;
    }

    const item = this.cartItems().find(i =>
      i.product.id === productId && i.size === size && i.color === color && i.design === design
    );
    if (!item) return null;

    // Stock check
    if (quantity > (item.stock ?? 9999)) return 'stock';

    // Weight check
    const otherWeight = this.cartItems()
      .filter(i => !(i.product.id === productId && i.size === size))
      .filter(i => i.checked)
      .reduce((s, i) => s + (i.weight || 0) * i.quantity, 0);
    const newWeight = (item.weight || 0) * quantity;
    if (otherWeight + newWeight > MAX_WEIGHT_GRAMS) return 'weight';

    this.cartItems.update(items =>
      items.map(i =>
        i.product.id === productId && i.size === size && i.color === color && i.design === design
          ? { ...i, quantity }
          : i
      )
    );
    this.recalculateDelivery();
    return null;
  }

  clearCart() {
    this.cartItems.set([]);
    this.deliveryFee.set(0);
  }

  isInCart(productId: number): boolean {
    return this.cartItems().some(i => i.product.id === productId);
  }

  recalculateDelivery() {
    const totalWeight = this.cartItems()
      .filter(i => i.checked)
      .reduce((sum, item) => {
        const unitWeight = item.weight || (item.product as any).weight_grams || 0;
        return sum + (unitWeight * item.quantity);
      }, 0);

    if (totalWeight === 0) {
      this.deliveryFee.set(199);
      return;
    }

    this.api.calculateShipping(totalWeight).subscribe({
      next:  (res: any) => this.deliveryFee.set(res.delivery_fee ?? 300),
      error: ()         => this.deliveryFee.set(300),
    });
  }

  wishlist_      = this.wishlistItems.asReadonly();
  addToWishlist(product: Product)       { if (!this.isInWishlist(product.id)) this.wishlistItems.update(i => [...i, { product }]); }
  removeFromWishlist(productId: number) { this.wishlistItems.update(i => i.filter(x => x.product.id !== productId)); }
  toggleWishlist(product: Product)      { this.isInWishlist(product.id) ? this.removeFromWishlist(product.id) : this.addToWishlist(product); }
  isInWishlist(productId: number)       { return this.wishlistItems().some(i => i.product.id === productId); }
  moveToCart(product: Product, size: string) { this.addToCart(product, size); this.removeFromWishlist(product.id); }
  getWishlistTotal()                    { return this.wishlist().reduce((t, i) => t + i.product.price, 0); }
}
