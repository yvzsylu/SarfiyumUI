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
    // --- GELİŞMİŞ ROL KONTROLÜ ---
    // Rotadan gelen beklenen rolleri al (Dizi veya Tekil olabilir)
    const expectedRoles = route.data['roles'] as string[];
    const expectedSingleRole = route.data['role'] as string;

    if (expectedRoles || expectedSingleRole) {
      // Beklenenleri küçük harf diziye çevir
      const rolesToMatch = expectedRoles 
        ? expectedRoles.map(r => r.toLowerCase()) 
        : [expectedSingleRole.toLowerCase()];

      const userRoles = Array.isArray(currentUser.roles) 
        ? currentUser.roles 
        : [currentUser.roles];

      // Kullanıcının rollerinden en az biri beklenen listede var mı?
      const hasRole = userRoles.some(r => r && rolesToMatch.includes(r.toLowerCase()));

      if (!hasRole) {
        // Yetki yoksa dashboard'a veya hata sayfasına atabilirsin
        return this.router.createUrlTree(['/user/dashboard']); 
      }
    }

    return true;
  }
}