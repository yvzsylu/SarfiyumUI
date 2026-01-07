import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  const cookieService = inject(CookieService);
  // AuthService'de token'ı '_AuthSessionKey' adıyla cookie'ye kaydetmiştik.
  const token = cookieService.get('_AuthSessionKey');

  // 🔥 DÜZELTME BURASI: 
  // Eğer istek "login" veya "reset-password" endpointlerine gidiyorsa, 
  // token eklemeden direkt geçir.
  if (req.url.includes('/auth/login') || req.url.includes('/auth/reset-password')) {
    return next(req);
  }

  
  if (token) {
    // İsteği kopyala ve Header'a token ekle
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};