import { CanActivateFn } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export const roleGuard: CanActivateFn = (route) => {
  const platformId = inject(PLATFORM_ID);
  const router = inject(Router);

  if (isPlatformBrowser(platformId)) {
    const role = localStorage.getItem('role');
    const requiredRole = route.data['role'];

    if (role === 'ADMIN') {
      return true;
    }

    if (role === requiredRole) {
      return true;
    }
    router.navigate(['/postlist']);
    return false;
  }

  return true;
};
