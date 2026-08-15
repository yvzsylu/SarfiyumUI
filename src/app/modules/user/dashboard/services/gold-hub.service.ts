import { Injectable, inject } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { CookieService } from 'ngx-cookie-service'; 
import { Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode'; // 🔥 1. IMPORT EKLENDİ

import { PriceData, PriceDelta, PriceSnapshot } from '@/app/core/models/price-data.model';
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

    // ⚠️ Dinleyiciler start()'TAN ÖNCE bağlanmalı.
    // Sunucu, bağlantı kurulur kurulmaz (OnConnectedAsync içinde) ilk tam listeyi
    // gönderiyor. Kayıt start() çözüldükten sonra yapılırsa bu mesaj yakalanamaz ve
    // ekran, bir sonraki snapshot'a kadar (en fazla 60 sn) boş kalır.
    this.registerEvents();

    this.hubConnection
      .start()
      .then(() => {
        this.connectionStatus$.next('Bağlandı');
      })
      .catch(err => {
        this.connectionStatus$.next('Bağlantı Hatası');
        console.error('SignalR Bağlantı Hatası:', err);
        this.handleAuthError(err);
      });
  }

  /**
   * Sunucu artık tam listeyi her seferinde göndermiyor:
   * bağlantıda / yapılandırma değişince / 60 saniyede bir SNAPSHOT,
   * aradaki tick'lerde yalnızca fiyatı oynayan satırlar için DELTA geliyor.
   * Bu servis parçaları birleştirip tüketiciye her zaman TAM listeyi verir,
   * böylece dashboard tarafı delta mantığını hiç bilmez.
   */
  private itemsById = new Map<string, PriceData>();
  private currentFeed: string | null = null;
  private lastSeq = -1;
  private hasSnapshot = false;

  private applySnapshot(msg: PriceSnapshot) {
    this.itemsById.clear();
    for (const item of msg.items ?? []) {
      this.itemsById.set(item.id, item);
    }

    // Akış değişmiş olabilir (örn. kuyumcu bu viewer'a özel fiyat tanımladı ve sunucu
    // bizi başka bir yayın grubuna taşıdı). Sıra takibi yeni akışa göre sıfırlanır.
    this.currentFeed = msg.feed;
    this.lastSeq = msg.seq;
    this.hasSnapshot = true;
    this.emitPrices();
  }

  private applyDelta(msg: PriceDelta) {
    // Kural 1: snapshot gelmeden delta uygulanmaz — aksi halde boş listeye
    // parça yazmaya çalışırız.
    if (!this.hasSnapshot) return;

    // Kural 2: BAŞKA bir akışa ait delta asla uygulanmaz.
    // Yayın grubu değiştiğinde eski gruptan yolda kalmış bir mesaj ulaşabilir. `seq`
    // numaraları grup başına ilerlediği için, eski grubun yüksek numarası yeni grubun
    // düşük numarasını "geçmiş" gibi gösterip sonraki tüm doğru delta'ları bloklardı.
    if (msg.feed !== this.currentFeed) return;

    // Kural 3: bağlantı anında hub'ın doğrudan gönderdiği snapshot ile gruba giden
    // yayının sırası garanti değil. Eski/eşit sıra numaralı delta yok sayılır.
    if (msg.seq <= this.lastSeq) return;

    for (const change of msg.changed ?? []) {
      const existing = this.itemsById.get(change.id);
      if (!existing) continue; // bilinmeyen ürün: 60 sn'lik tam senkron düzeltir

      // Yeni NESNE üretiliyor: dashboard eski/yeni fiyatı karşılaştırıp flash
      // efektine karar veriyor, mevcut nesneyi yerinde değiştirirsek eski değer kaybolur.
      this.itemsById.set(change.id, { ...existing, bid: change.bid, ask: change.ask });
    }

    this.lastSeq = msg.seq;
    this.emitPrices();
  }

  private emitPrices() {
    this.prices$.next(Array.from(this.itemsById.values()));
  }

  /** Yeniden bağlanmada durum sıfırlanır; sunucu yeni bir snapshot gönderecek. */
  private resetFeedState() {
    this.itemsById.clear();
    this.currentFeed = null;
    this.lastSeq = -1;
    this.hasSnapshot = false;
  }

  private registerEvents() {
    // 1. Tam liste
    this.hubConnection?.on('ReceivePriceSnapshot', (msg: PriceSnapshot) => {
      this.applySnapshot(msg);
    });

    // 2. Yalnızca değişenler
    this.hubConnection?.on('ReceivePriceDelta', (msg: PriceDelta) => {
      this.applyDelta(msg);
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

    // Yeniden bağlanma başladığında elimizdeki liste artık güvenilir değil:
    // kopukluk sırasında kaçırdığımız delta'lar olabilir. Durumu sıfırlıyoruz;
    // sunucu bağlantı kurulur kurulmaz yeni bir snapshot gönderiyor.
    this.hubConnection?.onreconnecting(() => {
      this.connectionStatus$.next('Yeniden bağlanılıyor...');
      this.resetFeedState();
    });

    this.hubConnection?.onreconnected(() => {
      this.connectionStatus$.next('Bağlandı');
    });

    // 3. Bağlantı Koptuğunda
    this.hubConnection?.onclose((error) => {
      console.warn('⚠️ Hub Bağlantısı Koptu:', error);

      this.resetFeedState();
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