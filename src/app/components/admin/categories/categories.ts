import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class Categories implements OnInit {

  categories: any[] = [];
  loading  = false;
  saving   = false;
  error    = '';
  success  = '';

  // Add form
  showAddForm = false;
  newCat = { name: '', is_active: true, sort_order: 0 };

  // Edit
  editingId: number | null = null;
  editCat: any = {};

  constructor(private apiService: Api) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.apiService.getAdminCategories().subscribe({
      next:  (cats) => { this.categories = cats; this.loading = false; },
      error: ()     => { this.loading = false; }
    });
  }

  addCategory() {
    if (!this.newCat.name.trim()) { this.error = 'Category name is required.'; return; }
    this.saving = true; this.error = '';
    this.apiService.createCategory(this.newCat).subscribe({
      next: () => {
        this.saving = false; this.success = 'Category added!';
        this.newCat = { name: '', is_active: true, sort_order: 0 };
        this.showAddForm = false;
        this.load();
        setTimeout(() => this.success = '', 2000);
      },
      error: (err) => { this.saving = false; this.error = err.error?.message || 'Failed to add.'; }
    });
  }

  startEdit(cat: any) {
    this.editingId = cat.id;
    this.editCat   = { name: cat.name, is_active: cat.is_active, sort_order: cat.sort_order };
  }

  saveEdit(id: number) {
    this.saving = true;
    this.apiService.updateCategory(id, this.editCat).subscribe({
      next: () => { this.saving = false; this.editingId = null; this.load(); },
      error: () => { this.saving = false; this.error = 'Update failed.'; }
    });
  }

  cancelEdit() { this.editingId = null; }

  deleteCategory(id: number) {
    if (!confirm('Delete this category?')) return;
    this.apiService.deleteCategory(id).subscribe({
      next:  () => { this.success = 'Deleted!'; this.load(); setTimeout(() => this.success = '', 2000); },
      error: () => { this.error = 'Delete failed.'; }
    });
  }

  toggleActive(cat: any) {
    this.apiService.updateCategory(cat.id, { is_active: !cat.is_active }).subscribe({
      next: () => this.load()
    });
  }
}