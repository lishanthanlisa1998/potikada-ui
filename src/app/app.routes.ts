import { Routes } from '@angular/router';
import { adminGuard } from './guards/admin-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./components/product-list/product-list').then(m => m.ProductListComponent)
  },
  {
    path: 'product/:id',
    loadComponent: () =>
      import('./components/product-detail/product-detail').then(m => m.ProductDetail)
  },
  {
    path: 'cart',
    loadComponent: () =>
      import('./components/cart/cart').then(m => m.Cart)
  },
  {
    path: 'checkout',
    loadComponent: () =>
      import('./components/checkout/checkout').then(m => m.Checkout)
  },
  {
    path: 'wishlist',
    loadComponent: () =>
      import('./components/wishlist/wishlist').then(m => m.Wishlist)
  },
  {
    path: 'order-success/:id',
    loadComponent: () =>
      import('./components/order-success/order-success').then(m => m.OrderSuccess)
  },
  // ── Affiliate ──
  {
    path: 'affiliate/login',
    loadComponent: () =>
      import('./components/affiliate/affiliate-login/affiliate-login').then(m => m.AffiliateLogin)
  },
  {
    path: 'affiliate/register',
    loadComponent: () =>
      import('./components/affiliate/affiliate-register/affiliate-register').then(m => m.AffiliateRegister)
  },
  {
    path: 'affiliate/dashboard',
    loadComponent: () =>
      import('./components/affiliate/affiliate-dashboard/affiliate-dashboard').then(m => m.AffiliateDashboard)
  },
  {
    path: 'affiliate/profile',
    loadComponent: () =>
      import('./components/affiliate/affiliate-profile/affiliate-profile').then(m => m.AffiliateProfile)
  },
  // ── Info Pages ──
  { path: 'about',            loadComponent: () => import('./components/pages/about/about').then(m => m.About) },
  { path: 'contact',          loadComponent: () => import('./components/pages/contact/contact').then(m => m.Contact) },
  { path: 'faq',              loadComponent: () => import('./components/pages/faq/faq').then(m => m.Faq) },
  { path: 'shipping-policy',  loadComponent: () => import('./components/pages/shipping-policy/shipping-policy').then(m => m.ShippingPolicy) },
  { path: 'returns-refunds',  loadComponent: () => import('./components/pages/returns-refunds/returns-refunds').then(m => m.ReturnsRefunds) },
  { path: 'privacy-policy',   loadComponent: () => import('./components/pages/privacy-policy/privacy-policy').then(m => m.PrivacyPolicy) },
  { path: 'terms-conditions', loadComponent: () => import('./components/pages/terms-conditions/terms-conditions').then(m => m.TermsConditions) },
  { path: 'sell-on-potikada', loadComponent: () => import('./components/pages/sell-on-potikada/sell-on-potikada').then(m => m.SellOnPotikada) },
  { path: 'our-mission',      loadComponent: () => import('./components/pages/our-mission/our-mission').then(m => m.OurMission) },
  // ── Admin ──
  {
    path: 'admin/login',
    loadComponent: () =>
      import('./components/admin/admin-login/admin-login').then(m => m.AdminLogin)
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./components/admin/admin-layout/admin-layout').then(m => m.AdminLayout),
    canActivate: [adminGuard],
    children: [
      { path: '',                redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./components/admin/dashboard/dashboard').then(m => m.Dashboard)
      },
      {
        path: 'products',
        loadComponent: () =>
          import('./components/admin/products/products').then(m => m.Products)
      },
      {
        path: 'products/create',
        loadComponent: () =>
          import('./components/admin/product-form/product-form').then(m => m.ProductForm)
      },
      {
        path: 'products/:id/edit',
        loadComponent: () =>
          import('./components/admin/product-form/product-form').then(m => m.ProductForm)
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./components/admin/orders/orders').then(m => m.Orders)
      },
      {
        path: 'affiliates',
        loadComponent: () =>
          import('./components/admin/affiliates/affiliates').then(m => m.Affiliates)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./components/admin/categories/categories').then(m => m.Categories)
      },
      {
        path: 'banners',
        loadComponent: () =>
          import('./components/admin/banners/banners').then(m => m.Banners)
      },
      {
        path: 'variant-families',
        loadComponent: () =>
          import('./components/admin/variant-families/variant-families').then(m => m.VariantFamilies)
      },
    ]
  }
];