import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { catchError, exhaustMap, map, tap } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import {
  login,
  loginFailure,
  loginSuccess,
  logout,
  logoutSuccess,
} from './authentication.actions';
import { AuthenticationService } from '@/app/core/services/auth.service';
import type { User } from './auth.model';

@Injectable()
export class AuthenticationEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  // 1. LOGIN EFFECT (Sadece API ve Token İşlemi)
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(({ username, password ,rememberMe}) =>
        this.authService.login(username, password, rememberMe).pipe(
          map((user: User) => {
            this.toastr.success('Giriş Başarılı', 'Yönlendiriliyorsunuz...');
            return loginSuccess({ user });
          }),
          catchError((error) => {
            let errorMessage = 'Giriş işlemi başarısız.';
            if (error.error && error.error.message) {
              errorMessage = error.error.message;
            }
            this.toastr.error(errorMessage, 'Hata');
            return of(loginFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // 2. REDIRECT EFFECT (Yönlendirme İşlemi)
  // loginSuccess tetiklendiğinde burası çalışır.
  loginRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(({ user }) => {
          // app.routes.ts dosyana göre rotalar:
          if (user.isAdmin) {
            // path: 'admin' tanımlı olduğu için
            this.router.navigate(['/admin']); 
          } else {
            // path: 'user' tanımlı olduğu için
            this.router.navigate(['/user']);
          }
        })
      ),
    { dispatch: false } // Yeni bir action tetiklemez, sadece yönlendirme yapar.
  );

  logout$ = createEffect(() =>
    this.actions$.pipe(
      ofType(logout),
      exhaustMap(() => {
        this.authService.logout();
        this.router.navigate(['/auth/login']);
        return of(logoutSuccess());
      })
    )
  );
}