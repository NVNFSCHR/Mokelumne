import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from './services/user';
import { map, take, filter } from 'rxjs/operators';

export const adminGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  return userService.currentUser$.pipe(
    filter(user => user !== undefined), // Warte bis User geladen
    take(1),
    map(user => {
      if (user?.role === 'admin') {
        return true; // ✅ Admin-Zugriff
      }
      // ❌ Kein Admin, zur Startseite umleiten
      return router.createUrlTree(['/']);
    })
  );
};
