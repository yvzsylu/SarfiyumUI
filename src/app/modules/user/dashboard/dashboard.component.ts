import { Component, OnInit, OnDestroy, inject, Inject, CUSTOM_ELEMENTS_SCHEMA, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { jwtDecode } from 'jwt-decode'; // 🔥 1. IMPORT EKLENDİ

import { GoldHubService } from './services/gold-hub.service';
import { AuthenticationService } from '@/app/core/services/auth.service'; // 🔥 2. IMPORT EKLENDİ
import { getUser } from '@store/authentication/authentication.selector';
import { PriceData } from '@/app/core/models/price-data.model';
import { environment } from '@environment/environment';

interface DashboardPriceItem extends PriceData {
  flashCss?: string;
  flashTimeout?: any;
}

type ThemeType = 'light' | 'dark' | 'financial';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DatePipe, NgbDropdownModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserDashboardComponent implements OnInit, OnDestroy {

  // Servisler
  private goldHub = inject(GoldHubService);
  private authService = inject(AuthenticationService); // 🔥 3. SERVİS INJECT EDİLDİ
  private store = inject(Store);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.isTvMode = this.router.url.includes('/tv/');
  }

  @HostListener('document:fullscreenchange')
  onFullScreenChange() {
    if (!this.document.fullscreenElement) {
      this.isTvMode = false;
      if (this.router.url.includes('/tv')) {
        const cleanUrl = this.router.url.replace('/tv', '');
        this.router.navigateByUrl(cleanUrl);
      }
    }
  }

  customizableColors = [
    { label: 'Kart Arkaplan', var: '--bg-card', value: '#EEEDED' },
    { label: 'Header Arkaplan', var: '--bg-header', value: '#EEEDED' },
    { label: 'Ticker (Kayan Bant)', var: '--bg-ticker', value: '#EEEDED' },
    { label: 'Ürün Açıklama Bg', var: '--item-description-bg', value: '#f1cc27' },
    { label: 'Tablo Başlık Yazı', var: '--table-head-row-text', value: '#F9F8F6' },
    { label: 'Başlık Yazıları (Title)', var: '--text-title', value: '#F9F8F6' },
    { label: 'İkon Arkaplan', var: '--icon-bg', value: '#c2c2c2' },
    { label: 'İkon Çerçeve', var: '--icon-border', value: '#c2c2c2' },
    { label: 'Kart Başlık Bg', var: '--card-header-bg', value: '#313647' },
    { label: 'Kart Başlık Çerçeve', var: '--card-header-border', value: '#313647' },
    { label: 'Tablo Başlık Bg', var: '--table-head-row-bg', value: '#313647' },
  ];

  isColorMenuOpen = false;

  // 🔥 YENİ: Rengi anlık olarak değiştiren fonksiyon
  updateCustomColor(cssVar: string, event: any) {
    const newValue = event.target.value;

    // Dashboard wrapper'ı bul ve stili üzerine yaz (Inline style olarak ekler, böylece en yüksek önceliği alır)
    const wrapper = document.querySelector('.dashboard-wrapper') as HTMLElement;
    if (wrapper) {
      wrapper.style.setProperty(cssVar, newValue);
    }
  }

  // Rengi sıfırlamak istersen diye opsiyonel metod (Wrapper üzerindeki style'ı siler)
  resetCustomColors() {
    const wrapper = document.querySelector('.dashboard-wrapper') as HTMLElement;
    if (wrapper) {
      this.customizableColors.forEach(c => wrapper.style.removeProperty(c.var));
    }
  }

  toggleColorMenu() {
    this.isColorMenuOpen = !this.isColorMenuOpen;
  }


  user$!: Observable<any>;
  public apiRoot = environment.apiUrl.replace('/api', '');

  allData: DashboardPriceItem[] = [];
  madenList: DashboardPriceItem[] = [];
  dovizList: DashboardPriceItem[] = [];
  bilezikList: DashboardPriceItem[] = [];
  ataResatList: DashboardPriceItem[] = [];
  krediList: DashboardPriceItem[] = [];

  currentTime = new Date();
  isTvMode = false;

  currentTheme: ThemeType = 'light';

  private subs: Subscription[] = [];
  private timeInterval: any;
  private logoutTimer: any; // 🔥 4. TIMER DEĞİŞKENİ

  ngOnInit(): void {
    // Tema Ayarları
    const savedTheme = localStorage.getItem('dashboard_theme') as ThemeType;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('light');
    }

    this.user$ = this.store.select(getUser);

    // Hub Başlat
    this.goldHub.startConnection();

    // Veri Akışı
    const priceSub = this.goldHub.prices$.subscribe(data => {
      if (data && data.length > 0) {
        const incomingData = data as DashboardPriceItem[];
        incomingData.forEach(item => {
          this.updateList(this.allData, item);
        });
        this.processData(incomingData);
      }
    });
    this.subs.push(priceSub);

    this.startClock();

    // 🔥 5. AUTO LOGOUT MANTIĞINI BAŞLAT
    this.initAutoLogout();
  }

  // =================================================================
  // 🔥 AUTO LOGOUT LOGIC START
  // =================================================================
  initAutoLogout() {
    const user = this.authService.user;

    // Kullanıcıda 'viewer' rolü var mı kontrol et
    const isViewer = user?.roles?.some(r => r.toLowerCase() === 'viewer');

    if (isViewer) {
      const token = this.authService.session;
      if (!token) return;

      try {
        const decoded: any = jwtDecode(token);
        const expTimestamp = decoded.exp; // Unix timestamp (saniye)

        if (expTimestamp) {
          const expirationDate = new Date(expTimestamp * 1000); // Milisaniyeye çevir
          const now = new Date();

          // Kalan süreyi hesapla
          const timeLeft = expirationDate.getTime() - now.getTime();

          // Konsola bilgi bas (Debug için)
          console.log(`👁️ Viewer Modu Aktif. Kalan Süre: ${(timeLeft / 1000 / 60).toFixed(2)} dakika.`);

          if (timeLeft > 0) {
            // Süre dolduğunda çalışacak sayaç
            this.logoutTimer = setTimeout(() => {
              this.handleExpiration();
            }, timeLeft);
          } else {
            // Süre zaten geçmişse hemen at
            this.handleExpiration();
          }
        }
      } catch (error) {
        console.error('Token decode hatası:', error);
      }
    }
  }

  handleExpiration() {
    // Çıkış yap ve login'e gönder
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
  // =================================================================
  // 🔥 AUTO LOGOUT LOGIC END
  // =================================================================

  setTheme(theme: ThemeType) {
    this.currentTheme = theme;
    localStorage.setItem('dashboard_theme', theme);
    this.cdr.detectChanges();
  }

  processData(data: DashboardPriceItem[]) {
    data.forEach(item => {
      let targetList: DashboardPriceItem[];

      switch (item.category) {
        case 'Maden': targetList = this.madenList; break;
        case 'Döviz': targetList = this.dovizList; break;
        case 'Bilezik': targetList = this.bilezikList; break;
        case 'Ata & Reşat': targetList = this.ataResatList; break;
        case 'Kredi Kartı': targetList = this.krediList; break;
        default: targetList = this.madenList; break;
      }
      this.updateList(targetList, item);
    });
  }

  updateList(list: DashboardPriceItem[], newItem: DashboardPriceItem) {
    const existingItem = list.find(x => x.symbol === newItem.symbol);

    if (existingItem) {
      const oldAsk = existingItem.ask || 0;
      const newAsk = newItem.ask || 0;

      existingItem.bid = newItem.bid;
      existingItem.ask = newItem.ask;
      existingItem.timestamp = newItem.timestamp;
      existingItem.description = newItem.description;

      if (newAsk !== oldAsk) {
        if (existingItem.flashTimeout) clearTimeout(existingItem.flashTimeout);

        if (newAsk > oldAsk) {
          existingItem.direction = 'up';
          existingItem.flashCss = 'text-flash-up';
        } else {
          existingItem.direction = 'down';
          existingItem.flashCss = 'text-flash-down';
        }

        this.cdr.detectChanges();

        existingItem.flashTimeout = setTimeout(() => {
          existingItem.flashCss = '';
          this.cdr.detectChanges();
        }, 400);
      }
    } else {
      newItem.direction = 'stable';
      newItem.flashCss = '';
      list.push(newItem);
    }
  }

  trackBySymbol(index: number, item: DashboardPriceItem): string {
    return item.symbol;
  }

  startClock() {
    this.timeInterval = setInterval(() => { this.currentTime = new Date(); }, 1000);
  }

  toggleTvMode() {
    if (this.isTvMode) return;
    const newUrl = '/tv' + this.router.url;
    this.enterFullScreen();
    this.router.navigateByUrl(newUrl);
    this.isTvMode = true;
  }

  enterFullScreen() {
    const elem = this.document.documentElement;
    if (elem.requestFullscreen) elem.requestFullscreen();
  }

  exitFullScreen() {
    if (this.document.exitFullscreen && this.document.fullscreenElement) this.document.exitFullscreen();
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    if (this.timeInterval) clearInterval(this.timeInterval);

    // 🔥 6. TIMER TEMİZLİĞİ
    if (this.logoutTimer) clearTimeout(this.logoutTimer);

    this.goldHub.stopConnection();
  }
}