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
      exhaustMap(({ username, password, rememberMe }) =>
        this.authService.login(username, password, rememberMe).pipe(
          map((user: User) => {
            this.toastr.success('Giriş Başarılı', 'Yönlendiriliyorsunuz...');
            return loginSuccess({ user });
          }),
          catchError((err) => {
            // Varsayılan hata mesajı
            let errorMessage = 'Giriş işlemi başarısız.';

            // 1. Durum: Backend'den gelen ServiceResult hatası (400, 401 vs.)
            // Backend errors dizisi dönüyor: { errors: ["Kullanıcı bulunamadı"], ... }
            if (err.error && err.error.errors && Array.isArray(err.error.errors)) {
              errorMessage = err.error.errors[0]; // Listeden ilk hatayı al
            }
            // 2. Durum: AuthService içinden bizim fırlattığımız "throw new Error" hataları
            else if (err.message) {
               errorMessage = err.message;
            }
            // 3. Durum: Standart string hata dönüşü
            else if (err.error && typeof err.error === 'string') {
              errorMessage = err.error;
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
  // ...
  loginRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(({ user }) => {
          if (user.isAdmin) {
            // DEĞİŞİKLİK BURADA: Tam yolu veriyoruz
            this.router.navigate(['/admin/dashboard']); 
          } else {
            // User için de benzer bir yapı varsa:
            this.router.navigate(['/user/dashboard']); // Örnek
          }
        })
      ),
    { dispatch: false }
  );
  // ...

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