import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Api } from '../../../services/api';
import { Auth } from '../../../services/auth';

@Component({
  selector: 'app-affiliate-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './affiliate-profile.html',
  styleUrl: './affiliate-profile.css',
})
export class AffiliateProfile implements OnInit {

  email         = '';
  affiliateCode = '';

  form = {
    name:           '',
    phone:          '',
    whatsapp:       '',
    account_name:   '',
    bank_name:      '',
    account_number: '',
  };

  passwords = {
    current: '',
    new:     '',
    confirm: '',
  };

  showCurrent = false;
  showNew     = false;
  showConfirm = false;

  profileLoading  = false;
  bankingLoading  = false;
  passwordLoading = false;
  error           = '';
  success         = '';

  constructor(
    private router: Router,
    private api: Api,
    private authService: Auth
  ) {}

  ngOnInit() {
    if (!this.authService.isAffiliateUser()) {
      this.router.navigate(['/affiliate/login']);
      return;
    }
    this.loadProfile();
  }

  loadProfile() {
    this.api.getAffiliateProfile().subscribe({
      next: (res: any) => {
        this.email         = res.email;
        this.affiliateCode = res.affiliate_code;
        this.form = {
          name:           res.name,
          phone:          res.phone          || '',
          whatsapp:       res.whatsapp       || '',
          account_name:   res.account_name   || '',
          bank_name:      res.bank_name      || '',
          account_number: res.account_number || '',
        };
      },
      error: () => {
        // fallback to localStorage
        const user         = this.authService.getAffiliateUser();
        this.email         = user?.email         || '';
        this.affiliateCode = user?.affiliate_code || '';
        this.form.name     = user?.name           || '';
      }
    });
  }

  getInitials(): string {
    return this.form.name
      .split(' ')
      .map((n: string) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  saveProfile() {
    if (!this.form.name || !this.form.phone) {
      this.error = 'Name and phone are required.';
      return;
    }
    this.profileLoading = true;
    this.error          = '';
    this.success        = '';

    this.api.updateAffiliateProfile({
      name:     this.form.name,
      phone:    this.form.phone,
      whatsapp: this.form.whatsapp,
    }).subscribe({
      next: (res: any) => {
        this.profileLoading = false;
        this.success        = 'Profile updated successfully!';
        // Update localStorage name
        const user  = this.authService.getAffiliateUser();
        user.name   = this.form.name;
        this.authService.affiliateLogin(user);
      },
      error: (err: any) => {
        this.profileLoading = false;
        this.error          = err.error?.message || 'Failed to update profile.';
      }
    });
  }

  saveBanking() {
    if (!this.form.account_name || !this.form.bank_name || !this.form.account_number) {
      this.error = 'All banking fields are required.';
      return;
    }
    this.bankingLoading = true;
    this.error          = '';
    this.success        = '';

    this.api.updateAffiliateProfile({
      account_name:   this.form.account_name,
      bank_name:      this.form.bank_name,
      account_number: this.form.account_number,
    }).subscribe({
      next: () => {
        this.bankingLoading = false;
        this.success        = 'Banking details updated successfully!';
      },
      error: (err: any) => {
        this.bankingLoading = false;
        this.error          = err.error?.message || 'Failed to update banking details.';
      }
    });
  }

  changePassword() {
    if (!this.passwords.current || !this.passwords.new) {
      this.error = 'Please fill all password fields.';
      return;
    }
    if (this.passwords.new.length < 8) {
      this.error = 'New password must be at least 8 characters.';
      return;
    }
    if (this.passwords.new !== this.passwords.confirm) {
      this.error = 'Passwords do not match.';
      return;
    }
    this.passwordLoading = true;
    this.error           = '';
    this.success         = '';

    this.api.updateAffiliatePassword({
      current_password:      this.passwords.current,
      new_password:          this.passwords.new,
      new_password_confirmation: this.passwords.confirm,
    }).subscribe({
      next: () => {
        this.passwordLoading  = false;
        this.success          = 'Password updated successfully!';
        this.passwords        = { current: '', new: '', confirm: '' };
      },
      error: (err: any) => {
        this.passwordLoading = false;
        this.error           = err.error?.message || 'Failed to update password.';
      }
    });
  }

  goBack() {
    this.router.navigate(['/affiliate/dashboard']);
  }
}