import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../../services/auth';
import { Popup, PopupConfig } from '../../shared/popup/popup';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-affiliate-register',
  imports: [CommonModule, FormsModule, RouterLink, Popup],
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

  sameAsPhone         = false;
  showPassword        = false;
  showConfirmPassword = false;
  loading             = false;
  error               = '';
  success             = '';
  popup: PopupConfig | null = null;

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
    this.popup = { type: 'warning', title: 'Missing Info', message: 'Please enter your name and email first.' };
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
      this.popup = { type: 'error', title: 'Failed', message: err.error?.message || 'Failed to send OTP.' };
    }
  });
}

verifyOtp() {
  if (!this.otpCode) {
    this.popup = { type: 'warning', title: 'Missing OTP', message: 'Please enter the OTP.' };
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
      this.popup = { type: 'error', title: 'Invalid OTP', message: err.error?.message || 'Invalid OTP.' };
    }
  });
}

  validate(): boolean {
    if (!this.fullName)      { this.popup = { type: 'warning', title: 'Missing Information', message: 'Full name is required.' }; return false; }
    if (!this.email)         { this.popup = { type: 'warning', title: 'Missing Information', message: 'Email is required.' }; return false; }
    if (!this.phone)         { this.popup = { type: 'warning', title: 'Missing Information', message: 'Phone number is required.' }; return false; }
    if (!this.nicNumber)     { this.popup = { type: 'warning', title: 'Missing Information', message: 'NIC number is required.' }; return false; }
    if (!this.accountName)   { this.popup = { type: 'warning', title: 'Missing Information', message: 'Account holder name is required.' }; return false; }
    if (!this.bankName)      { this.popup = { type: 'warning', title: 'Missing Information', message: 'Please select your bank.' }; return false; }
    if (!this.accountNumber) { this.popup = { type: 'warning', title: 'Missing Information', message: 'Account number is required.' }; return false; }
    if (!this.password || this.password.length < 8) {
      this.popup = { type: 'warning', title: 'Missing Information', message: 'Password must be at least 8 characters.' }; return false;
    }
    if (this.password !== this.confirmPassword) {
      this.popup = { type: 'warning', title: 'Missing Information', message: 'Passwords do not match.' }; return false;
    }
    if (!this.agreeTerms) {
      this.popup = { type: 'warning', title: 'Missing Information', message: 'Please agree to the Terms and Conditions.' }; return false;
    }
    return true;
  }

  submit() {
    console.log("lisa")
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
        this.popup = { type: 'error', title: 'Registration Failed', message: err.error?.message || 'Registration failed. Please try again.' };
      }
    });
  }

  onSameAsPhone() {
    if (this.sameAsPhone) this.whatsapp = this.phone;
    else this.whatsapp = '';
  }

  goToLogin() {
    this.router.navigate(['/affiliate/login']);
  }
}