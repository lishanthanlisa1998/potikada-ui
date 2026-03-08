import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-affiliate-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './affiliate-register.html',
  styleUrl: './affiliate-register.css',
})
export class AffiliateRegister {

// Personal Info
  firstName = '';
  lastName = '';
  nicNumber = '';
  address = '';
  city = '';
  email = '';

  // Account Info
  username = '';
  password = '';
  confirmPassword = '';
  showPassword = false;
  showConfirmPassword = false;
  phoneNumber = '';
  whatsappNumber = '';

  // Banking Info
  bankName = '';
  branch = '';
  accountName = '';
  agreeTerms = false;

  // File uploads
  nicFileName = '';
  bankFileName = '';

  constructor(private router: Router) {}

  togglePassword() { this.showPassword = !this.showPassword; }
  toggleConfirmPassword() { this.showConfirmPassword = !this.showConfirmPassword; }

  onNicFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.nicFileName = file.name;
  }

  onBankFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.bankFileName = file.name;
  }

  triggerNicUpload() {
    document.getElementById('nicFileInput')?.click();
  }

  triggerBankUpload() {
    document.getElementById('bankFileInput')?.click();
  }

  submit() {
    this.router.navigate(['/affiliate/dashboard']);
  }

  goToLogin() {
    this.router.navigate(['/affiliate/login']);
  }
}