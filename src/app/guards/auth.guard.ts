import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserContextService } from '../context/user.context';
import { firstValueFrom } from 'rxjs';
import { MainService } from '../../services/main.services';

export const AuthGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const userContext = inject(UserContextService);
  console.log(userContext.currentUser)
  const currentUser = userContext.currentUser?.user;
  if (currentUser) return true;

  if (typeof window === 'undefined') return router.createUrlTree(['/auth/login']);

  const user_email = window.sessionStorage.getItem('user_email');
  console.log("user_email", user_email)
  if (!user_email) return router.createUrlTree(['/auth/login']);

  try {
    const userService = inject(MainService);
    const res = await firstValueFrom(userService.auth({ email: user_email, pwd: "" }));
    if (res.data) {
      userContext.currentUser = { user: res.data.user };
      return true;
    }
  } catch {
    return router.createUrlTree(['/auth/login']);
  }

  return router.createUrlTree(['/auth/login']);
};
