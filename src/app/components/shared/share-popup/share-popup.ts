import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-share-popup',
  imports: [],
  templateUrl: './share-popup.html',
  styleUrl: './share-popup.css',
})
export class SharePopup {
 @Input() isOpen = false;
  @Input() shareLink = '';
  @Output() closed = new EventEmitter<void>();

  copied = false;

  close() {
    this.copied = false;
    this.closed.emit();
  }

  copyLink() {
    navigator.clipboard.writeText(this.shareLink).catch(() => {});
    this.copied = true;
    setTimeout(() => this.copied = false, 2500);
  }

  shareOnWhatsApp() {
    const msg = encodeURIComponent(`Check this out on Potikada! 🛍️\n${this.shareLink}`);
    window.open(`https://wa.me/?text=${msg}`, '_blank');
    this.close();
  }
}
