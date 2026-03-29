import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostListener,
  ElementRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-category-dropdown',
  imports: [CommonModule],
  templateUrl: './category-dropdown.html',
  styleUrl: './category-dropdown.css',
})
export class CategoryDropdown {

  // ── Inputs ──────────────────────────────
  @Input() categories: string[] = [];
  @Input() selectedCategory: string = 'all';

  // ── Outputs ─────────────────────────────
  @Output() categoryChange = new EventEmitter<string>();

  // ── State ───────────────────────────────
  isOpen = false;

  constructor(private el: ElementRef) {}

  // ── Toggle open/close ───────────────────
  toggleDropdown(): void {
    this.isOpen = !this.isOpen;
  }

  // ── Close dropdown ───────────────────────
  closeDropdown(): void {
    this.isOpen = false;
  }

  // ── Select a category ───────────────────
  selectCategory(cat: string): void {
    this.selectedCategory = cat;
    this.categoryChange.emit(cat);
    this.isOpen = false;
  }

  // ── Close when clicking outside ──────────
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.el.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }

  // ── Close on Escape key ──────────────────
  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.isOpen = false;
  }
}