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

  public decodeToken(token: string): User {
    const decoded = jwtDecode<JwtPayload>(token);

    return {
      id: decoded.userId,
      username: decoded.sub,
      email: decoded.email,
      // Roles kontrolü aynen kalıyor
      roles: Array.isArray(decoded.roles) 
                    ? decoded.roles.map((r: string) => r.toLowerCase())
                    : [decoded.roles.toLowerCase()],
      isAdmin: Array.isArray(decoded.roles) 
          ? decoded.roles.some((r: string) => r.toLowerCase() === 'admin')
          : (decoded.roles as string).toLowerCase() === 'admin',
      token: token,
    };
  }
}