import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service'; 
// PriceData modelinin yolunu projene göre ayarla:
import { PriceData } from '@/app/core/models/price-data.model'; 
import { environment } from '@environment/enviroment';

@Injectable({
  providedIn: 'root' 
})
export class GoldHubService {
  private hubConnection: signalR.HubConnection | undefined;
  
  public prices$ = new BehaviorSubject<PriceData[]>([]);
  public connectionStatus$ = new BehaviorSubject<string>('Bağlantı bekleniyor...');

  // Environment'tan al veya manuel set et
  private apiUrl = environment.apiUrl.replace('/api', '') + '/goldhub'; 
  
  private readonly authSessionKey = '_AuthSessionKey'; 
  private cookieService = inject(CookieService); 

  constructor() { }

  public startConnection(): void {
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
      })
      .catch(err => {
        this.connectionStatus$.next('Bağlantı Hatası');
        console.error('SignalR Bağlantı Hatası:', err);
      });

    this.hubConnection.on('ReceivePrices', (data: PriceData[]) => {
      this.prices$.next(data);
    });
  }

  public stopConnection() {
    if (this.hubConnection) {
      this.hubConnection.stop();
    }
  }
}