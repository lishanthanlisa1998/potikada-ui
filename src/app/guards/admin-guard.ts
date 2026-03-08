import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = () => {
  const router = inject(Router);

  const token = localStorage.getItem('admin_token');
  const user  = localStorage.getItem('admin_user');

  if (!token || !user) {
    router.navigate(['/admin/login']);
    return false;
  }

  try {
    const parsed = JSON.parse(user);
    if (parsed.role !== 'admin') {
      router.navigate(['/admin/login']);
      return false;
    }
    return true;
  } catch {
    router.navigate(['/admin/login']);
    return false;
  }
};