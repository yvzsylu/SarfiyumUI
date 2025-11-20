import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { AuthenticationService } from '@/app/core/services/auth.service'; 
import { User } from '@/app/store/authentication/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private authService = inject(AuthenticationService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    
    // 1. Önce servisteki anlık kullanıcıya bak
    let currentUser = this.authService.user;

    // 2. Eğer kullanıcı bellekte yoksa (sayfa yenilendi vs.), COOKIE'ye bak!
    if (!currentUser) {
      const token = this.authService.session;
      
      if (token) {
        try {
          // Token varsa kullanıcıyı tekrar oluştur
          currentUser = this.authService.decodeToken(token);
          this.authService.user = currentUser; 
        } catch (e) {
          this.authService.logout();
          return this.router.createUrlTree(['/auth/login']);
        }
      }
    }

    // 3. Hala kullanıcı yoksa -> Login'e git
    if (!currentUser) {
      return this.router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url },
      });
    }

    // 4. Rol Kontrolü (Admin/User)
    const expectedRole = route.data['role'] as 'admin' | 'user' | undefined;
    
    if (expectedRole) {
       const userRoles = Array.isArray(currentUser.roles) 
            ? currentUser.roles 
            : [currentUser.roles];

       // --- DÜZELTME BURADA YAPILDI ---
       // 'r &&' ekleyerek r'nin undefined olmadığından emin olduk.
       // Ayrıca 'currentUser.roles' undefined gelme ihtimaline karşı güvenli hale getirdik.
       const hasRole = userRoles.some(r => r && r.toLowerCase() === expectedRole.toLowerCase());

       if (!hasRole) {
         return this.router.createUrlTree(['/auth/login']);
       }
    }

    return true;
  }
}