import { Pipe, PipeTransform } from '@angular/core';
 
@Pipe({ name: 'countInStock', standalone: true })
export class CountInStockPipe implements PipeTransform {
  transform(variants: any[]): number {
    if (!variants || variants.length === 0) return 0;
    return variants.filter(v => v.stock > 0).length;
  }
}
 