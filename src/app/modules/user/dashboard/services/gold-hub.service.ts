import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service'; // Cookie servisini ekledik
import { PriceData } from '../../../../core/models/price-data.model'; // Modelin yeri (yolunu kontrol et)

@Injectable({
  // Eğer sadece Dashboard'da çalışsın, başka yerden erişilmesin istersen 'root' yerine
  // DashboardComponent'in providers array'ine ekleyebilirsin. 
  // Ama 'root' kalması da performans sorunu yaratmaz, singleton olur.
  providedIn: 'root' 
})
export class GoldHubService {
  private hubConnection: signalR.HubConnection | undefined;
  
  // Veri yayını için Subject
  public prices$ = new BehaviorSubject<PriceData[]>([]);
  public connectionStatus$ = new BehaviorSubject<string>('Bağlantı bekleniyor...');

  // Backend adresi
  private apiUrl = 'https://localhost:7140/goldhub'; 
  
  // Auth servisindeki key ile AYNI olmalı
  private readonly authSessionKey = '_AuthSessionKey'; 

  // Yeni inject yöntemi (Angular 14+)
  private cookieService = inject(CookieService); 

  constructor() { }

  public startConnection(): void {
    // 1. Token'ı COOKIE'den alıyoruz
    const token = this.cookieService.get(this.authSessionKey);

    if (!token) {
      console.error('❌ Token cookie içinde bulunamadı! SignalR başlatılamıyor.');
      this.connectionStatus$.next('Yetki Hatası');
      return;
    }

    // 2. Bağlantıyı Oluştur
    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(this.apiUrl, {
        // Backend, token'ı query string'den okuyacak (?access_token=...)
        accessTokenFactory: () => token 
      })
      .withAutomaticReconnect()
      .build();

    // 3. Başlat
    this.hubConnection
      .start()
      .then(() => {
        this.connectionStatus$.next('Bağlandı');
        console.log('✅ GoldHub Bağlantısı Başarılı (Cookie Auth)');
      })
      .catch(err => {
        this.connectionStatus$.next('Bağlantı Hatası');
        console.error('SignalR Bağlantı Hatası:', err);
      });

    // 4. Veriyi Dinle
    this.hubConnection.on('ReceivePrices', (data: PriceData[]) => {
      // Gelen veriyi abonelere dağıt
      this.prices$.next(data);
    });
  }

  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
      console.log('GoldHub Bağlantısı Durduruldu');
    }
  }
}