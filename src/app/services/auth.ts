import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Api } from './api';

@Injectable({ providedIn: 'root' })
export class Auth {

  currentUser  = signal<any>(null);
  isLoggedIn   = signal<boolean>(false);
  isAffiliateUser = signal<boolean>(!!localStorage.getItem('affiliate_user'));
  isAdminUser  = signal<boolean>(!!localStorage.getItem('admin_token'));

  constructor(
    private api: Api,
    private router: Router
  ) {
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('user');
    if (token && user) {
      this.currentUser.set(JSON.parse(user));
      this.isLoggedIn.set(true);
    }
  }

  getAffiliateUser(): any {
    const raw = localStorage.getItem('affiliate_user');
    return raw ? JSON.parse(raw) : null;
  }

  affiliateLogin(userData: any) {
    localStorage.setItem('affiliate_user', JSON.stringify(userData));
    this.isAffiliateUser.set(true);
  }

  affiliateLogout() {
    localStorage.removeItem('affiliate_user');
    this.isAffiliateUser.set(false);
  }

  login(email: string, password: string) {
    return this.api.login({ email, password }).pipe(
      tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.currentUser.set(res.user);
        this.isLoggedIn.set(true);
      })
    );
  }

  logout() {
    this.api.logout().subscribe();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.isLoggedIn.set(false);
    this.router.navigate(['/']);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isAffiliateRole(): boolean {
    const user = this.currentUser();
    return user?.role === 'affiliate';
  }
}