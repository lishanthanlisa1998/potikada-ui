import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Api } from '../../../services/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.html',
  styleUrl: './admin-login.css',
})
export class AdminLogin {
email    = '';
  password = '';
  loading  = false;
  error    = '';
  showPassword = false;

  constructor(
    private apiService: Api,
    private router: Router
  ) {
    // Already logged in? redirect
    const token = localStorage.getItem('admin_token');
    if (token) this.router.navigate(['/admin/dashboard']);
  }

  login() {
    if (!this.email || !this.password) {
      this.error = 'Please enter email and password.';
      return;
    }

    this.loading = true;
    this.error   = '';

    this.apiService.adminLogin(this.email, this.password).subscribe({
      next: (res) => {
        localStorage.setItem('admin_token', res.token);
        localStorage.setItem('admin_user', JSON.stringify(res.user));
        this.router.navigate(['/admin/dashboard']);
      },
      error: (err) => {
        this.loading = false;
        this.error   = err.error?.message || 'Invalid credentials.';
      }
    });
  }
}