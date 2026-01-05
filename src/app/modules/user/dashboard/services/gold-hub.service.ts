import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service'; 
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode'; // 🔥 1. IMPORT EKLENDİ

import { PriceData } from '@/app/core/models/price-data.model'; 
import { environment } from '@environment/environment';
import { AuthenticationService } from '@/app/core/services/auth.service';

@Injectable({
  providedIn: 'root' 
})
export class GoldHubService {
  private hubConnection: signalR.HubConnection | undefined;
  
  public prices$ = new BehaviorSubject<PriceData[]>([]);
  public connectionStatus$ = new BehaviorSubject<string>('Bağlantı bekleniyor...');

  private apiUrl = environment.apiUrl.replace('/api', '') + '/goldhub'; 
  
  private readonly authSessionKey = '_AuthSessionKey'; 
  
  private cookieService = inject(CookieService); 
  private authService = inject(AuthenticationService);
  private router = inject(Router);

  constructor() { }

  public startConnection(): void {
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
      .withAutomaticReconnect()
      .build();

    this.hubConnection
      .start()
      .then(() => {
        this.connectionStatus$.next('Bağlandı');
        console.log('✅ GoldHub Bağlantısı Başarılı');
        
        this.registerEvents();
      })
      .catch(err => {
        this.connectionStatus$.next('Bağlantı Hatası');
        console.error('SignalR Bağlantı Hatası:', err);
        this.handleAuthError(err);
      });
  }

  private registerEvents() {
    // 1. Fiyatları Dinle
    this.hubConnection?.on('ReceivePrices', (data: PriceData[]) => {
      this.prices$.next(data);
    });

    // =================================================================
    // 🔥 2. CONCURRENT SESSION CONTROL (CANLI KICK)
    // =================================================================
    this.hubConnection?.on('ForceCheckSession', (serverSessionId: string, serverClientSource: string) => {
        // console.log('🔔 Sunucudan oturum kontrol isteği geldi:', serverClientSource);

        // a. Bu mesaj Web (Angular) için mi?
        if (serverClientSource !== 'Web' && serverClientSource !== '1') {
            return; // Mesaj mobil için, biz Web'iz. İlgilenme.
        }

        // b. Token'ı al ve SessionId kontrolü yap
        const token = this.authService.session;
        if (!token) return;

        try {
            const decoded: any = jwtDecode(token);
            // Token içindeki claim ismi backend'de 'SessionId' olarak eklenmişti.
            const mySessionId = decoded.SessionId || decoded.sessionId;

            // c. Eğer Backend'den gelen ID ile bendeki ID farklıysa -> ATILDIM
            if (mySessionId && mySessionId !== serverSessionId) {
                console.warn('⛔ Hesabınız başka bir tarayıcıda açıldı. Oturum kapatılıyor.');
                // alert("Hesabınız başka bir cihazda açıldığı için sonlandırılıyor."); // İsteğe bağlı uyarı
                this.forceLogout();
            }
        } catch (error) {
            console.error('Session check sırasında token decode hatası:', error);
        }
    });
    // =================================================================

    // 3. Bağlantı Koptuğunda
    this.hubConnection?.onclose((error) => {
      console.warn('⚠️ Hub Bağlantısı Koptu:', error);

      this.checkAndLogoutIfExpired();

      // Eğer hata "401" içeriyorsa veya sunucu tarafından zorla kapatıldıysa
      // ve kullanıcı hala login görünüyorsa
      if (this.authService.isLoggedIn()) {
          // Normal internet kopması değilse (error genelde null olmaz sunucu attığında)
          // Burada da tetiklenebilir ama ForceCheckSession daha garantidir.
      }
    });
  }

  private checkAndLogoutIfExpired() {
    const validUser = this.authService.getUserFromCookie();
    
    if (!validUser) {
        console.log('⏳ Oturum süresi dolduğu veya geçersiz olduğu için bağlantı sonlandırılıyor...');
        this.forceLogout();
    }
  }

  private handleAuthError(err: any) {
    if (err && (err.toString().includes('401') || err.toString().includes('Unauthorized'))) {
      this.forceLogout();
    }
  }

  private forceLogout() {
    this.stopConnection(); 
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}