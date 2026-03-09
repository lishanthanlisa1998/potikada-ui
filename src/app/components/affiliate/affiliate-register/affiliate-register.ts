import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-affiliate-register',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './affiliate-register.html',
  styleUrl: './affiliate-register.css',
})
export class AffiliateRegister {
fullName        = '';
  email           = '';
  phone           = '';
  whatsapp        = '';
  nicNumber       = '';
  accountName     = '';
  bankName        = '';
  accountNumber   = '';
  password        = '';
  confirmPassword = '';
  agreeTerms      = false;

  showPassword        = false;
  showConfirmPassword = false;
  loading             = false;
  error               = '';
  success             = '';

  step       = 1; // 1=email, 2=otp, 3=full form
  otpCode    = '';
  otpSent    = false;
  otpVerified = false;
  otpLoading = false;

  constructor(
    private router: Router,
    private api: Api,
    private authService: Auth
  ) {}

  sendOtp() {
  if (!this.fullName || !this.email) {
    this.error = 'Please enter your name and email first.';
    return;
  }
  this.otpLoading = true;
  this.error      = '';

  this.api.sendOtp({ email: this.email, name: this.fullName }).subscribe({
    next: () => {
      this.otpLoading = false;
      this.otpSent    = true;
      this.step       = 2;
      this.success    = 'OTP sent! Check your email.';
    },
    error: (err: any) => {
      this.otpLoading = false;
      this.error      = err.error?.message || 'Failed to send OTP.';
    }
  });
}

verifyOtp() {
  if (!this.otpCode) {
    this.error = 'Please enter the OTP.';
    return;
  }
  this.otpLoading = true;
  this.error      = '';

  this.api.verifyOtp({ email: this.email, otp: this.otpCode }).subscribe({
    next: () => {
      this.otpLoading  = false;
      this.otpVerified = true;
      this.step        = 3;
      this.success     = 'Email verified! Complete your registration.';
    },
    error: (err: any) => {
      this.otpLoading = false;
      this.error      = err.error?.message || 'Invalid OTP.';
    }
  });
}

  validate(): boolean {
    if (!this.fullName)      { this.error = 'Full name is required.';           return false; }
    if (!this.email)         { this.error = 'Email is required.';               return false; }
    if (!this.phone)         { this.error = 'Phone number is required.';        return false; }
    if (!this.nicNumber)     { this.error = 'NIC number is required.';          return false; }
    if (!this.accountName)   { this.error = 'Account holder name is required.'; return false; }
    if (!this.bankName)      { this.error = 'Please select your bank.';         return false; }
    if (!this.accountNumber) { this.error = 'Account number is required.';      return false; }
    if (!this.password || this.password.length < 8) {
      this.error = 'Password must be at least 8 characters.'; return false;
    }
    if (this.password !== this.confirmPassword) {
      this.error = 'Passwords do not match.'; return false;
    }
    if (!this.agreeTerms) {
      this.error = 'Please agree to the Terms and Conditions.'; return false;
    }
    return true;
  }

  submit() {
    this.error   = '';
    this.success = '';

    if (!this.validate()) return;

    this.loading = true;

    const data = {
      name:           this.fullName,
      email:          this.email,
      phone:          this.phone,
      whatsapp:       this.whatsapp,
      nic_number:     this.nicNumber,
      account_name:   this.accountName,
      bank_name:      this.bankName,
      account_number: this.accountNumber,
      password:       this.password,
    };

    this.api.affiliateRegister(data).subscribe({
      next: (res: any) => {
        this.authService.affiliateLogin(res.affiliate);
        this.success = 'Account created successfully! Redirecting...';
        setTimeout(() => this.router.navigate(['/affiliate/dashboard']), 1500);
      },
      error: (err: any) => {
        this.loading = false;
        this.error   = err.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  goToLogin() {
    this.router.navigate(['/affiliate/login']);
  }
}