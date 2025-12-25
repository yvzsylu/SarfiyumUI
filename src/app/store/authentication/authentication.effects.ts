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
            // Redirect: true çünkü kullanıcı butona bastı
            return loginSuccess({ user, redirect: true });
          }),
          catchError((err) => {
            // --- errorMessage DEĞİŞKENİNİ BURADA TANIMLIYORUZ ---
            let errorMessage = 'Giriş işlemi başarısız.';

            // 1. Backend ServiceResult hatası (errors array)
            if (err.error && err.error.errors && Array.isArray(err.error.errors)) {
              errorMessage = err.error.errors[0];
            }
            // 2. JS Error nesnesi
            else if (err.message) {
               errorMessage = err.message;
            }
            // 3. String hata
            else if (err.error && typeof err.error === 'string') {
              errorMessage = err.error;
            }

            this.toastr.error(errorMessage, 'Hata');
            
            // Artık errorMessage tanımlı olduğu için hata vermeyecek
            return of(loginFailure({ error: errorMessage }));
          })
        )
      )
    )
  );

  // 2. REDIRECT EFFECT (Yönlendirme Mantığı)
loginRedirect$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(loginSuccess),
      tap(({ user, redirect }) => { 
        
        if (!redirect) {
           return; 
        }

        // Kullanıcının Viewer olup olmadığını kontrol et
        const isViewer = user.roles?.includes('viewer');

        if (user.isAdmin) {
          // Sistem Genel Admini (Sarfiyum Yönetici)
          this.router.navigate(['/admin/dashboard']); 
        } 
        else if (isViewer) {
          // Sadece izleme yetkisi olan kullanıcı (Kuyumcu İzleyicisi)
          this.router.navigate(['/user/dashboard']); 
        }
        else {
          // Standart Tenant User/Manager
          this.router.navigate(['/user/dashboard']); 
        }
      })
    ),
  { dispatch: false }
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