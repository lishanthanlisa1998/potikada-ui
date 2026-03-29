import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Api } from '../../../services/api';
import { Popup, PopupConfig } from '../../shared/popup/popup';

@Component({
  selector: 'app-variant-families',
  standalone: true,
  imports: [CommonModule, FormsModule, Popup],
  templateUrl: './variant-families.html',
  styleUrl: './variant-families.css'
})
export class VariantFamilies implements OnInit {

  families: any[] = [];
  loading = true;
  saving = false;
  popup: PopupConfig | null = null;

  // Add form
  showAddForm = false;
  newFamily = { name: '', description: '', sort_order: 0 };

  // Edit
  editingId: number | null = null;
  editData: any = {};

  // Delete confirm
  deleteTarget: any = null;

  constructor(private api: Api) {}

  ngOnInit() {
    this.load();
  }

  load() {
    this.loading = true;
    this.api.getAdminVariantFamilies().subscribe({
      next: (data) => { this.families = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
  }

  // ── ADD ──
  openAdd() {
    this.showAddForm = true;
    this.newFamily = { name: '', description: '', sort_order: this.families.length + 1 };
  }

  saveNew() {
    if (!this.newFamily.name.trim()) {
      this.popup = { type: 'warning', title: 'Missing Name', message: 'Please enter a family name.' };
      return;
    }
    this.saving = true;
    this.api.createVariantFamily(this.newFamily).subscribe({
      next: () => {
        this.saving = false;
        this.showAddForm = false;
        this.popup = { type: 'success', title: 'Created!', message: `"${this.newFamily.name}" family added.`, confirmLabel: 'OK' };
        this.load();
      },
      error: (err) => {
        this.saving = false;
        const msg = err?.error?.message || 'Could not create family.';
        this.popup = { type: 'error', title: 'Failed', message: msg };
      }
    });
  }

  // ── EDIT ──
  startEdit(family: any) {
    this.editingId = family.id;
    this.editData = { name: family.name, description: family.description, sort_order: family.sort_order, is_active: family.is_active };
  }

  saveEdit(family: any) {
    if (!this.editData.name.trim()) {
      this.popup = { type: 'warning', title: 'Missing Name', message: 'Family name cannot be empty.' };
      return;
    }
    this.saving = true;
    this.api.updateVariantFamily(family.id, this.editData).subscribe({
      next: () => {
        this.saving = false;
        this.editingId = null;
        this.popup = { type: 'success', title: 'Updated!', message: `"${this.editData.name}" saved.`, confirmLabel: 'OK' };
        this.load();
      },
      error: () => {
        this.saving = false;
        this.popup = { type: 'error', title: 'Failed', message: 'Could not update family.' };
      }
    });
  }

  cancelEdit() {
    this.editingId = null;
    this.editData = {};
  }

  // ── TOGGLE ACTIVE ──
  toggleActive(family: any) {
    this.api.updateVariantFamily(family.id, { is_active: !family.is_active }).subscribe({
      next: () => this.load(),
      error: () => this.popup = { type: 'error', title: 'Failed', message: 'Could not update status.' }
    });
  }

  // ── DELETE ──
  confirmDelete(family: any) {
    this.deleteTarget = family;
    this.popup = {
      type: 'confirm',
      title: 'Delete Family?',
      message: `Delete "${family.name}"? This cannot be undone. Products using this family will be affected.`,
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel'
    };
  }

  onPopupConfirmed() {
    if (this.deleteTarget) {
      this.api.deleteVariantFamily(this.deleteTarget.id).subscribe({
        next: () => {
          this.deleteTarget = null;
          this.popup = null;
          this.load();
        },
        error: (err) => {
          this.deleteTarget = null;
          const msg = err?.error?.message || 'Could not delete family.';
          this.popup = { type: 'error', title: 'Cannot Delete', message: msg };
        }
      });
    } else {
      this.popup = null;
    }
  }
}