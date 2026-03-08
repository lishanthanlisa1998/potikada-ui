import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-earn-money-popup',
  imports: [],
  templateUrl: './earn-money-popup.html',
  styleUrl: './earn-money-popup.css',
})
export class EarnMoneyPopup {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();

  constructor(private router: Router) {}

  close() {
    this.closed.emit();
  }
  openLogin(){
     this.router.navigate(['affiliate/login']);
    
  }

}
