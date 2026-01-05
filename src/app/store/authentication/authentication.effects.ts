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
// Model importlarını kontrol et
import { ServiceResult } from '@/app/core/models/service-result.model'; 

@Injectable()
export class AuthenticationEffects {
  private actions$ = inject(Actions);
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  // 1. LOGIN EFFECT
  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(login),
      exhaustMap(({ username, password, rememberMe }) =>
        this.authService.login(username, password, rememberMe).pipe(
          map((res: ServiceResult<string>) => { // 🔥 Servisten gelen tip artık ServiceResult
            
            // 1. Servis başarılı mı döndü?
            if (res.isSuccess && res.data) {
                this.toastr.success('Giriş Başarılı', 'Yönlendiriliyorsunuz...');
                
                // 🔥 User objesini authService üzerinden alıyoruz (veya token'ı decode ediyoruz)
                // AuthenticationService.login içinde zaten this.user'ı set etmiştik.
                // Güvenli olsun diye tekrar token decode da yapabiliriz veya servisteki user'ı alabiliriz.
                // En temizi servisteki decodeToken metodunu kullanmak:
                const user = this.authService.decodeToken(res.data);

                // Redirect: true çünkü kullanıcı butona bastı
                return loginSuccess({ user, redirect: true });
            } else {
                // Backend 200 dönse bile isSuccess false ise hata fırlat
                throw new Error(res.errors?.[0] || 'Giriş başarısız.');
            }
          }),
          catchError((err) => {
            let errorMessage = 'Giriş işlemi başarısız.';

            // 1. Backend ServiceResult hatası (errors array)
            if (err.error && err.error.errors && Array.isArray(err.error.errors)) {
              errorMessage = err.error.errors[0];
            }
            // 2. JS Error nesnesi (throw new Error ile fırlattıklarımız buraya düşer)
            else if (err.message) {
               errorMessage = err.message;
            }
            // 3. String hata
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

  // 2. REDIRECT EFFECT (Yönlendirme Mantığı - Burası Aynı Kalıyor)
  loginRedirect$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(loginSuccess),
        tap(({ user, redirect }) => { 
          
          if (!redirect) {
             return; 
          }

          // Role kontrolü (Güvenli olması için küçük harfe çevirerek kontrol)
          const roles = user.roles?.map(r => r.toLowerCase()) || [];
          const isViewer = roles.includes('viewer');

          if (user.isAdmin) {
            // Sistem Genel Admini
            this.router.navigate(['/admin/dashboard']); 
          } 
          else if (isViewer) {
            // Sadece izleme yetkisi olan kullanıcı
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