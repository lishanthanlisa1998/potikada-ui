import { Component } from '@angular/core';
import { Header } from '../../shared/header/header';
import { Router } from '@angular/router';

@Component({
  selector: 'app-about',
  imports: [Header],
  templateUrl: './about.html',
  styleUrl: './about.css',
})
export class About {
  constructor(private router: Router) {}
  navigate(path: string) {
    this.router.navigate([path]);
    
  }

}
