import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-menu',
  imports: [CommonModule],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  @Input()  open   = false;
  @Output() closed = new EventEmitter<void>();

  constructor(private router: Router) {}

  close() { this.closed.emit(); }

  navigate(path: string) {
    this.router.navigate([path]);
    this.close();
  }
}