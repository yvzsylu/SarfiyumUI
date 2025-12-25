import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service'; 
import { Router } from '@angular/router'; // 🔥 EKLENDİ

import { PriceData } from '@/app/core/models/price-data.model'; 
import { environment } from '@environment/environment';
import { AuthenticationService } from '@/app/core/services/auth.service'; // 🔥 EKLENDİ

@Injectable({
  providedIn: 'root' 
})
export class GoldHubService {
  private hubConnection: signalR.HubConnection | undefined;
  
  public prices$ = new BehaviorSubject<PriceData[]>([]);
  public connectionStatus$ = new BehaviorSubject<string>('Bağlantı bekleniyor...');

  private apiUrl = environment.apiUrl.replace('/api', '') + '/goldhub'; 
  
  private readonly authSessionKey = '_AuthSessionKey'; 
  
  // 🔥 SERVİSLER EKLENDİ
  private cookieService = inject(CookieService); 
  private authService = inject(AuthenticationService);
  private router = inject(Router);

  constructor() { }

  public startConnection(): void {
    // Eğer zaten bağlıysa tekrar başlatma
    if (this.hubConnection?.state === signalR.HubConnectionState.Connected) return;

    const token = this.cookieService.get(this.authSessionKey);

    if (!token) {
      console.error('❌ Token cookie içinde bulunamadı! SignalR başlatılamıyor.');
      this.connectionStatus$.next('Yetki Hatası');
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.apiUrl, {
        accessTokenFactory: () => token 
      })
      // Otomatik bağlanmayı açık bırakıyoruz, ama token bitmişse aşağıda yakalayacağız
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        this.connectionStatus$.next('Bağlandı');
        console.log('✅ GoldHub Bağlantısı Başarılı');
        
        // 🔥 EVENT DİNLEYİCİLERİ BAŞLAT
        this.registerEvents();
      })
      .catch(err => {
        this.connectionStatus$.next('Bağlantı Hatası');
        console.error('SignalR Bağlantı Hatası:', err);
        this.handleAuthError(err); // Hata 401 ise at
      });
  }

  private registerEvents() {
    // Fiyatları Dinle
    this.hubConnection?.on('ReceivePrices', (data: PriceData[]) => {
      this.prices$.next(data);
    });

    // 🔥 BAĞLANTI KAPANDIĞINDA (Server Abort ettiğinde burası çalışır)
    this.hubConnection?.onclose((error) => {
      console.warn('⚠️ Hub Bağlantısı Koptu:', error);

      // Backend Context.Abort() yaptığında bazen error undefined gelebilir,
      // veya "Server closed the connection" diyebilir.
      // Her durumda Viewer kullanıcısıysak ve bağlantı koptuysa token'ı kontrol etmeliyiz.
      
      this.checkAndLogoutIfExpired();

      if (error && error.message.includes('401')) {
        this.forceLogout();
      }
    });
  }

  // Token süresi bitmişse kullanıcıyı at
  private checkAndLogoutIfExpired() {
    const user = this.authService.user;
    
    // Sadece Viewer ise bu kontrolü yap (Admin/User'ın interneti kopmuş olabilir, onları atma)
    if (user?.roles?.some(r => r.toLowerCase() === 'viewer')) {
        // Token'ın süresi bitmiş mi diye Auth Service'e güveniyoruz
        // AuthService.getUserFromCookie() metodu süresi biten token'ı null dönüyordu.
        const validUser = this.authService.getUserFromCookie();
        
        if (!validUser) {
            console.log('⏳ Viewer süresi dolduğu için bağlantı sonlandırılıyor...');
            this.forceLogout();
        }
    }
  }

  private handleAuthError(err: any) {
    if (err && (err.toString().includes('401') || err.toString().includes('Unauthorized'))) {
      this.forceLogout();
    }
  }

  private forceLogout() {
    this.stopConnection(); // Tekrar bağlanmayı durdur
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}