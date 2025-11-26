import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import { CookieService } from 'ngx-cookie-service';
import { jwtDecode } from 'jwt-decode';

import type { User } from '@/app/store/authentication/auth.model';
import { environment } from '../../../environments/enviroment';
// ServiceResult modelini import et (yolunu projene göre ayarla)
import { ServiceResult } from '@/app/core/models/service-result.model'; 

interface JwtPayload {
  sub: string;
  jti: string;
  userId: string;
  email: string;
  fullName: string; 
  roles: string | string[]; 
  exp: number;
  iss: string;
}

@Injectable({ providedIn: 'root' })
export class AuthenticationService {
  user: User | null = null;
  public readonly authSessionKey = '_AuthSessionKey';
  
  private cookieService = inject(CookieService);
  // Toastr genelde Effect tarafında kullanılır ama burada kalsın istersen
  private toastr = inject(ToastrService); 

  constructor(private http: HttpClient) {}

getUserFromCookie(): User | null {
    // 1. Cookie var mı?
    const token = this.cookieService.get(this.authSessionKey);
    console.log('🔍 [1] Cookie Okundu:', token ? 'Evet, Token Var' : 'HAYIR, Token Yok! (Cookie Adı Yanlış Olabilir)');

    if (!token) return null;

    try {
      const decoded = jwtDecode<JwtPayload>(token);
      console.log('🔓 [2] Token Ham Decode:', decoded);

      const currentTime = Date.now() / 1000;
      if (decoded.exp && decoded.exp < currentTime) {
        console.warn('⌛ [3] Token Süresi Dolmuş!');
        this.cookieService.delete(this.authSessionKey);
        return null;
      }
      
      const userResult = this.decodeToken(token);
      console.log('✅ [4] User Modeli Oluşturuldu:', userResult);
      return userResult;

    } catch (error) {
      console.error('❌ [Error] Token Decode Hatası:', error);
      return null;
    }
  }

  // GÜNCELLENMİŞ DECODE METODU
  public decodeToken(token: string): User {
    const decoded = jwtDecode<JwtPayload>(token);

    // Rol yönetimi: String gelirse Array'e çevir
    let userRoles: string[] = [];
    if (decoded.roles) {
        if (Array.isArray(decoded.roles)) {
            userRoles = decoded.roles.map(r => r.toLowerCase());
        } else {
            // Tek string gelirse (Senin durumun: "Admin")
            userRoles = [decoded.roles.toLowerCase()];
        }
    }

    return {
      id: decoded.userId,
      username: decoded.sub,
      email: decoded.email,
      fullName: decoded.fullName, 
      roles: userRoles,
      isAdmin: userRoles.includes('admin'),
      token: token,
    };
  }

  // Login dönüş tipini Observable<User> olarak düşünebiliriz
  login(username: string, password: string, rememberMe: boolean) {
    // 1. Değişiklik: Dönüş tipi ServiceResult<string> oldu
    return this.http.post<ServiceResult<string>>(`${environment.apiUrl}/Auth/login`, { username, password })
      .pipe(
        map((res) => {
          // 2. Değişiklik: isSuccess kontrolü ve data'dan token alma
          if (res.isSuccess && res.data) {
            const token = res.data; // Backend artık direkt token string dönüyor wrapper içinde
            const user = this.decodeToken(token);
            this.user = user;
            
            this.saveSession(token, rememberMe);

            // 2. Kullanıcı Adını Hatırla (UX İçin - LocalStorage)
            if (rememberMe) {
              localStorage.setItem('remembered_username', username);
              localStorage.setItem('is_remembered', 'true');
            } else {
              // Eğer tiki kaldırdıysa hafızadan da sil
              localStorage.removeItem('remembered_username');
              localStorage.removeItem('is_remembered');
            }

            return user;
          }
          
          // Eğer 200 dönüp isSuccess false ise (nadir durum ama mümkün)
          throw new Error(res.errors?.[0] || 'Login failed');
        })
      );
  }

  logout(): void {
    this.removeSession();
    this.user = null;
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