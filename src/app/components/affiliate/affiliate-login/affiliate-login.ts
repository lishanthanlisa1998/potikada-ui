import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../../services/api';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-affiliate-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './affiliate-login.html',
  styleUrl: './affiliate-login.css',
})
export class AffiliateLogin {
  email        = '';
  password     = '';
  showPassword = false;
  loading      = false;
  error        = '';

  constructor(
    private router: Router,
    private api: Api,
    private authService: Auth
  ) {}

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  login() {
    if (!this.email || !this.password) {
      this.error = 'Please enter email and password.';
      return;
    }

    this.loading = true;
    this.error   = '';

    this.api.affiliateLogin({ email: this.email, password: this.password }).subscribe({
      next: (res: any) => {
        this.authService.affiliateLogin(res.affiliate);
        this.router.navigate(['/affiliate/dashboard']);
      },
      error: (err: any) => {
        this.loading = false;
        this.error   = err.error?.message || 'Invalid email or password.';
      }
    });
  }

  loginWithGoogle() {
    // Coming soon
    this.error = 'Google login coming soon!';
  }

  goToRegister() {
    this.router.navigate(['/affiliate/register']);
  }
}