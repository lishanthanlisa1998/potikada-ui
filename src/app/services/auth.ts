
import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { Api } from './api';

@Injectable({ providedIn: 'root' })
export class Auth {

  currentUser = signal<any>(null);
  isLoggedIn  = signal<boolean>(false);

  constructor(
    private api: Api,
    private router: Router
  ) {
    // Check if token exists on app load
    const token = localStorage.getItem('token');
    const user  = localStorage.getItem('user');
    if (token && user) {
      this.currentUser.set(JSON.parse(user));
      this.isLoggedIn.set(true);
    }
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

  isAffiliate(): boolean {
    const user = this.currentUser();
    return user?.role === 'affiliate';
  }
}