import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../../services/api';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-banners',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './banners.html',
  styleUrl: './banners.css',
})
export class Banners implements OnInit {

  banners:  any[] = [];
  loading   = false;
  saving    = false;
  uploading = false;
  error     = '';
  success   = '';

  showAddForm = false;
  newBanner = { image_url: '', link_url: '', title: '', is_active: true, sort_order: 0 };

  editingId: number | null = null;
  editBanner: any = {};

  constructor(private apiService: Api) {}

  ngOnInit() { this.load(); }

  load() {
    this.loading = true;
    this.apiService.getAdminBanners().subscribe({
      next:  (b) => { this.banners = b; this.loading = false; },
      error: ()  => { this.loading = false; }
    });
  }

  async onBannerImageSelected(event: any, target: 'new' | number) {
    const file = event.target.files[0];
    if (!file) return;
    this.uploading = true;
    const { cloudName, uploadPreset } = environment.cloudinary;
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);
    formData.append('folder', 'potikada/banners');
    try {
      const res  = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: 'POST', body: formData });
      const data = await res.json();
      if (target === 'new') this.newBanner.image_url = data.secure_url;
      else this.editBanner.image_url = data.secure_url;
    } catch { this.error = 'Image upload failed.'; }
    this.uploading = false;
  }

  addBanner() {
    if (!this.newBanner.image_url) { this.error = 'Please add a banner image.'; return; }
    this.saving = true; this.error = '';
    this.apiService.createBanner(this.newBanner).subscribe({
      next: () => {
        this.saving = false; this.success = 'Banner added!';
        this.newBanner = { image_url: '', link_url: '', title: '', is_active: true, sort_order: 0 };
        this.showAddForm = false; this.load();
        setTimeout(() => this.success = '', 2000);
      },
      error: (err) => { this.saving = false; this.error = err.error?.message || 'Failed.'; }
    });
  }

  startEdit(b: any) {
    this.editingId = b.id;
    this.editBanner = { image_url: b.image_url, link_url: b.link_url || '', title: b.title || '', is_active: b.is_active, sort_order: b.sort_order };
  }

  saveEdit(id: number) {
    this.saving = true;
    this.apiService.updateBanner(id, this.editBanner).subscribe({
      next: () => { this.saving = false; this.editingId = null; this.load(); },
      error: () => { this.saving = false; this.error = 'Update failed.'; }
    });
  }

  cancelEdit() { this.editingId = null; }

  deleteBanner(id: number) {
    if (!confirm('Delete this banner?')) return;
    this.apiService.deleteBanner(id).subscribe({
      next:  () => { this.success = 'Deleted!'; this.load(); setTimeout(() => this.success = '', 2000); },
      error: () => { this.error = 'Delete failed.'; }
    });
  }

  toggleActive(b: any) {
    this.apiService.updateBanner(b.id, { is_active: !b.is_active }).subscribe({ next: () => this.load() });
  }
}