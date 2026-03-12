import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

export type PopupType = 'success' | 'error' | 'warning' | 'confirm';

export interface PopupConfig {
  type: PopupType;
  title?: string;
  message: string;
  confirmLabel?: string;  // default: 'OK'
  cancelLabel?: string;   // only shown for 'confirm' type
}

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './popup.html',
  styleUrl: './popup.css',
})
export class Popup {

  @Input()  config: PopupConfig | null = null;
  @Output() confirmed = new EventEmitter<void>();
  @Output() cancelled = new EventEmitter<void>();

  get icon(): string {
    switch (this.config?.type) {
      case 'success': return '✅';
      case 'error':   return '❌';
      case 'warning': return '⚠️';
      case 'confirm': return '🤔';
      default:        return 'ℹ️';
    }
  }

  get defaultConfirmLabel(): string {
    switch (this.config?.type) {
      case 'success': return 'OK, Great!';
      case 'error':   return 'OK, Fix It';
      case 'warning': return 'Understood';
      case 'confirm': return 'Yes, Confirm';
      default:        return 'OK';
    }
  }

  onConfirm() { this.confirmed.emit(); }
  onCancel()  { this.cancelled.emit(); }
  onOverlay() { this.cancelled.emit(); }
}