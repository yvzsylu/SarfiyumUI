import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';

import { CookieService } from 'ngx-cookie-service';
import type { User } from '@/app/store/authentication/auth.model';
import { environment } from '../../../environments/enviroment';
import { jwtDecode } from 'jwt-decode';


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
  private toastr = inject(ToastrService);

  constructor(private http: HttpClient) {}

  login(username: string, password: string, rememberMe: boolean) {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/Account/login`, { username, password }).pipe(
      map((res) => {
        if (res && res.token) {
          const user = this.decodeToken(res.token);
          this.user = user;
          // Token'ı kaydederken rememberMe bilgisini kullan
          this.saveSession(user.token!, rememberMe);
          return user;
        }
        throw new Error('Invalid login response');
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

  // Cookie kaydetme mantığını güncelle
  saveSession(token: string, rememberMe: boolean = false): void {
    if (rememberMe) {
      // Beni hatırla seçildiyse: Bugünden itibaren 7 gün geçerli olsun
      this.cookieService.set(this.authSessionKey, token, 7, '/'); 
    } else {
      // Seçilmediyse: Tarayıcı kapanınca silinsin (Session Cookie)
      // 3. parametreyi (expires) boş veya null gönderirsen session cookie olur.
      this.cookieService.set(this.authSessionKey, token, undefined, '/'); 
    }
  }

  removeSession(): void {
    this.cookieService.delete(this.authSessionKey);
  }

  public  decodeToken(token: string): User {
    const decoded = jwtDecode<JwtPayload>(token);

    return {
      id: decoded.userId,
      username: decoded.sub,
      email: decoded.email,
      roles: Array.isArray(decoded.roles) 
                    ? decoded.roles.map((r: string) => r.toLowerCase())
                    : [decoded.roles.toLowerCase()],
      isAdmin: Array.isArray(decoded.roles) 
      ? decoded.roles.some((r: string) => r.toLowerCase() === 'admin')
      : decoded.roles.toLowerCase() === 'admin',
      token: token,
    };
  }
}
