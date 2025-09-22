import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowed: ('rider' | 'driver' | 'admin')[] = route.data?.['roles'] ?? [];
  const user = auth.user();

  // si pas connecté -> login
  if (!auth.isLoggedIn() || !user) {
    router.navigate(['/auth/login']);
    return false;
  }

  // si aucune contrainte -> ok
  if (!allowed.length) return true;

  // check rôle
  if (allowed.includes(user.role)) return true;

  // sinon -> 403 (ou home)
  router.navigate(['/home'], { queryParams: { error: 'forbidden' } });
  return false;
};
