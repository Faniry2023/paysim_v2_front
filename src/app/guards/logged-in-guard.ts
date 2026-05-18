import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserStore } from '../store/user.store';

export const loggedInGuard: CanActivateFn = async (route, state) => {
  const router = inject(Router);
  const store = inject(UserStore);
  await store.Me();
  if(!store.isLogged()){
    router.navigate(['/signup']);
    return false;
  }

  return true;
};
