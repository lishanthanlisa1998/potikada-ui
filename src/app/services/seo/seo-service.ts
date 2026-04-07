import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class SeoService {

  constructor(
    private title: Title,
    private meta:  Meta
  ) {}

  setProduct(product: any, price: number) {
    const name  = product.name;
    const desc  = typeof product.description === 'string'
      ? product.description.substring(0, 160)
      : `Buy ${name} on Potikada - Sri Lanka's artisan marketplace`;
    const image = product.image || product.images?.[0] || '';
    const url   = `https://potikada.lk/product/${product.id}`;
    const ogUrl = `https://api.potikada.lk/og/product/${product.id}`;

    this.title.setTitle(`${name} | Potikada`);
    this.setMeta(name, desc, image, ogUrl, price);
    // Also update canonical to real URL
    this.updateCanonical(url);
  }

  setPage(titleStr: string, desc: string) {
    this.title.setTitle(`${titleStr} | Potikada`);
    this.meta.updateTag({ name: 'description', content: desc });
    this.meta.updateTag({ property: 'og:title',       content: titleStr });
    this.meta.updateTag({ property: 'og:description',  content: desc });
    this.meta.updateTag({ property: 'og:url',          content: 'https://potikada.lk' });
    this.meta.updateTag({ property: 'og:image',        content: 'https://potikada.lk/assets/potikadalogo.png' });
  }

  updateCanonical(url: string) {
    let link = document.querySelector('link[rel=canonical]') as HTMLLinkElement;
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = url;
  }

  private setMeta(title: string, desc: string, image: string, url: string, price?: number) {
    // Basic
    this.meta.updateTag({ name: 'description', content: desc });

    // Open Graph (Facebook, WhatsApp)
    this.meta.updateTag({ property: 'og:type',         content: 'product' });
    this.meta.updateTag({ property: 'og:title',        content: title });
    this.meta.updateTag({ property: 'og:description',  content: desc });
    this.meta.updateTag({ property: 'og:image',        content: image });
    this.meta.updateTag({ property: 'og:url',          content: url });
    this.meta.updateTag({ property: 'og:site_name',    content: 'Potikada' });

    // Price
    if (price) {
      this.meta.updateTag({ property: 'product:price:amount',   content: price.toString() });
      this.meta.updateTag({ property: 'product:price:currency', content: 'LKR' });
    }

    // Twitter Card
    this.meta.updateTag({ name: 'twitter:card',        content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title',       content: title });
    this.meta.updateTag({ name: 'twitter:description', content: desc });
    this.meta.updateTag({ name: 'twitter:image',       content: image });
  }
}
