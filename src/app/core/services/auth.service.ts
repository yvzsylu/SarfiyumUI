import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, tap } from 'rxjs/operators'; // tap eklendi
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';
import { Observable } from 'rxjs';

import type { User } from '@/app/store/authentication/auth.model';
import { environment } from '../../../environments/environment';
// ServiceResult modelin
import { ServiceResult } from '@/app/core/models/service-result.model'; 

interface JwtPayload {
  sub: string;
  jti: string;
  userId: string;
  email: string;
  fullName: string; 
  tenantId: string;
  tenantName: string;
  tenantLogoUrl: string;
  roles: string | string[]; 
  exp: number;
  iss: string;
  subscriptionEndDate?: string;
  SessionId?: string; 
  ClientSource?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  user: User | null = null;
  public readonly authSessionKey = '_AuthSessionKey';
  
  private cookieService = inject(CookieService);
  private toastr = inject(ToastrService); 

  constructor(private http: HttpClient) {}

  getUserFromCookie(): User | null {
    const token = this.cookieService.get(this.authSessionKey);

    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      
      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        this.cookieService.delete(this.authSessionKey);
        return null;
      }
      
      const userResult = this.decodeToken(token);
      this.user = userResult; 
      return userResult;

    } catch (error) {
      return null;
    }
  }

  public decodeToken(token: string): User {
    const decoded = jwtDecode<JwtPayload>(token);

    let userRoles: string[] = [];
    if (decoded.roles) {
        if (Array.isArray(decoded.roles)) {
            userRoles = decoded.roles.map(r => r.toLowerCase());
        } else {
            userRoles = [decoded.roles.toLowerCase()];
        }
    }

    return {
      id: decoded.userId,
      username: decoded.sub,
      email: decoded.email,
      fullName: decoded.fullName,
      subscriptionEndDate: decoded.subscriptionEndDate, 
      tenantId: decoded.tenantId,
      tenantName: decoded.tenantName,
      tenantLogoUrl: decoded.tenantLogoUrl,
      roles: userRoles,
      isAdmin: userRoles.includes('admin'),
      token: token,
    };
  }

  // 🔥 DÜZELTİLDİ: Artık ServiceResult<string> dönüyor.
  // Store/Effect tarafındaki yapın bozulmayacak.
  login(username: string, password: string, rememberMe: boolean): Observable<ServiceResult<string>> {
    return this.http.post<ServiceResult<string>>(`${environment.apiUrl}/auth/login`, { 
        username, 
        password,
        clientSource: 1 // 🔥 1 = Web (Backend Enum karşılığı)
    })
      .pipe(
        // 'map' yerine 'tap' veya veriyi değiştirmeyen bir 'map' kullanıyoruz.
        // Yan etkileri (Cookie kaydetme, User state'i güncelleme) burada hallediyoruz.
        map((res) => {
          if (res.isSuccess && res.data) {
            const token = res.data;
            
            // Servis içindeki user state'ini güncelle
            const user = this.decodeToken(token);
            this.user = user;
            
            // Cookie'ye kaydet
            this.saveSession(token, rememberMe);

            // LocalStorage işlemleri
            if (rememberMe) {
              localStorage.setItem('remembered_username', username);
              localStorage.setItem('is_remembered', 'true');
            } else {
              localStorage.removeItem('remembered_username');
              localStorage.removeItem('is_remembered');
            }
          }
          
          // 🔥 ÖNEMLİ: Gelen yanıtı (ServiceResult) olduğu gibi geri döndürüyoruz.
          // Böylece NGRX Effect tarafında res.isSuccess kontrolünü yapmaya devam edebilirsin.
          return res;
        })
      );
  }

  // Reset password için de aynı yapı
  resetPassword(email: string): Observable<ServiceResult<string>> {
    return this.http.post<ServiceResult<string>>(`${environment.apiUrl}/auth/reset-password`, { email });
  }

  logout(): void {
    this.removeSession();
    this.user = null;
  }

  isLoggedIn(): boolean {
      return !!this.getUserFromCookie();
  }

  get session(): string {
    return this.cookieService.get(this.authSessionKey);
  }

  saveSession(token: string, rememberMe: boolean = false): void {
    if (rememberMe) {
      this.cookieService.set(this.authSessionKey, token, 7, '/'); 
    } else {
      this.cookieService.set(this.authSessionKey, token, undefined, '/'); 
    }
  }

  removeSession(): void {
    this.cookieService.delete(this.authSessionKey);
  }
}