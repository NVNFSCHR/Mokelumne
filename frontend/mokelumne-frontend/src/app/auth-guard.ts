import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './services/auth';
import { map, take } from 'rxjs/operators';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.authState$.pipe(
    take(1),
    map(user => {
      if (user) {
        return true; // Benutzer ist angemeldet
      }
      // Benutzer ist nicht angemeldet, zur Login-Seite umleiten
      return router.createUrlTree(['/login']);
    })
  );
};
