import { HttpClient, HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { UserStore } from '../store/user.store';
import { catchError, EMPTY, from, Observable, switchMap } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<any>,
  next:HttpHandlerFn):Observable<HttpEvent<any>> =>{
    const router = inject(Router);
    const store = inject(UserStore);

    if(req.url.match(/\/(signin|signup|me)$/)){
      return next(req);
    }

    if(store.user()){
      return next(req);
    }

    return from(store.Me()).pipe(
      switchMap(() => {
        if(store.user()){
          return next(req);
        }else{
          router.navigate(['/signup']);
          return EMPTY;
        }
      }),catchError(() =>{
        router.navigate(['/signup']);
        return EMPTY;
      })
    )
  }
