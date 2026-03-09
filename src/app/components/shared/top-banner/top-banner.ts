import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth } from '../../../services/auth';
import { Api } from '../../../services/api';

@Component({
  selector: 'app-top-banner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-banner.html',
  styleUrl: './top-banner.css'
})
export class TopBanner {

liveBalance: number = 0;

  constructor(public authService: Auth, private api: Api) {}

  ngOnInit() {
    if (this.authService.isAffiliateUser()) {
      this.loadBalance();
    }
  }

  loadBalance() {
    this.api.getAffiliateBalance().subscribe({
      next: (res: any) => {
        this.liveBalance = res.balance;
      },
      error: () => {
        // fallback to local
        this.liveBalance = this.authService.getAffiliateUser()?.balance || 0;
      }
    });
  }

  logout() {

    this.authService.affiliateLogout();
  }
}