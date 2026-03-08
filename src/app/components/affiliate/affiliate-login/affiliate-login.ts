import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-affiliate-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './affiliate-login.html',
  styleUrl: './affiliate-login.css',
})
export class AffiliateLogin {
email = '';
  password = '';
  showPassword = false;

  constructor(private router: Router) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  loginWithGoogle() {
    this.router.navigate(['/affiliate/dashboard']);
  }

  login() {
    this.router.navigate(['/affiliate/dashboard']);
  }

  goToRegister() {
    this.router.navigate(['/affiliate/register']);
  }
}