import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard = (role: string): CanActivateFn => {
  return () => {
    const router = inject(Router);

    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('role');

    // Login nahi hai
    if (!token) {
      router.navigate(['/login']);
      return false;
    }

    // Role match nahi karta
    if (userRole !== role) {
      // Apne role ke panel pe bhejo
      if (userRole === 'Admin') router.navigate(['/admin/dashboard']);
      else if (userRole === 'Agent') router.navigate(['/agent/dashboard']);
      else if (userRole === 'PrivateSeller') router.navigate(['/seller/dashboard']);
      else router.navigate(['/home']);
      return false;
    }

    return true;
  };
};