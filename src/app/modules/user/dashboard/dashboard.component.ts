import { Component, OnInit, OnDestroy, inject, Inject, CUSTOM_ELEMENTS_SCHEMA, HostListener, ChangeDetectorRef, NgZone } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { jwtDecode } from 'jwt-decode';

import { GoldHubService } from './services/gold-hub.service';
import { AuthenticationService } from '@/app/core/services/auth.service';
import { getUser } from '@store/authentication/authentication.selector';
import { PriceData } from '@/app/core/models/price-data.model';
import { environment } from '@environment/environment';

import { CategoryService } from '@/app/modules/user/categories/services/category.service';
import { SettingsService } from '../multiplier-settings/services/multiplier-settings.service';

interface DashboardPriceItem extends PriceData {
  categoryIndex?: number;
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

  private goldHub = inject(GoldHubService);
  private authService = inject(AuthenticationService);
  private categoryService = inject(CategoryService);
  private settingsService = inject(SettingsService);
  private store = inject(Store);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.isTvMode = this.router.url.includes('/tv/');
  }

  // --- Fullscreen & Theme Logic ---
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

  themeDefaults: any = {
    light: {
      '--bg-card': '#EEEDED', '--bg-header': '#EEEDED', '--bg-ticker': '#EEEDED',
      '--item-description-bg': '#f1cc27', '--table-head-row-text': '#F9F8F6', '--text-title': '#F9F8F6',
      '--icon-bg': '#c2c2c2', '--icon-border': '#c2c2c2', '--card-header-bg': '#313647',
      '--card-header-border': '#313647', '--table-head-row-bg': '#313647',
    },
    dark: {
      '--bg-card': '#222831', '--bg-header': '#222831', '--bg-ticker': '#222831',
      '--item-description-bg': '#393E46', '--table-head-row-text': '#EEEEEE', '--text-title': '#EEEEEE',
      '--icon-bg': '#393E46', '--icon-border': '#393E46', '--card-header-bg': '#5d543b',
      '--card-header-border': '#5d543b', '--table-head-row-bg': '#5d543b',
    },
    financial: {
      '--bg-card': '#132240', '--bg-header': '#0f2242', '--bg-ticker': '#162a52',
      '--item-description-bg': '#374f79', '--table-head-row-text': '#F9F5EB', '--text-title': '#F9F5EB',
      '--icon-bg': '#0F2854', '--icon-border': '#0F2854', '--card-header-bg': '#4988C4',
      '--card-header-border': '#4988C4', '--table-head-row-bg': '#4988C4',
    }
  };

  customizableColors = [
    { label: 'Kart Arkaplan', var: '--bg-card', value: '' },
    { label: 'Header Arkaplan', var: '--bg-header', value: '' },
    { label: 'Ticker (Kayan Bant)', var: '--bg-ticker', value: '' },
    { label: 'Ürün Açıklama Bg', var: '--item-description-bg', value: '' },
    { label: 'Tablo Başlık Yazı', var: '--table-head-row-text', value: '' },
    { label: 'Başlık Yazıları (Title)', var: '--text-title', value: '' },
    { label: 'İkon Arkaplan', var: '--icon-bg', value: '' },
    { label: 'İkon Çerçeve', var: '--icon-border', value: '' },
    { label: 'Kart Başlık Bg', var: '--card-header-bg', value: '' },
    { label: 'Kart Başlık Çerçeve', var: '--card-header-border', value: '' },
    { label: 'Tablo Başlık Bg', var: '--table-head-row-bg', value: '' },
  ];
  isColorMenuOpen = false;

  updateCustomColor(cssVar: string, event: any) {
    const newValue = event.target.value;
    const wrapper = document.querySelector('.dashboard-wrapper') as HTMLElement;
    if (wrapper) wrapper.style.setProperty(cssVar, newValue);
  }

  syncColorPickers(theme: ThemeType) {
    const currentDefaults = this.themeDefaults[theme];
    if (currentDefaults) {
      this.customizableColors.forEach(colorItem => colorItem.value = currentDefaults[colorItem.var]);
    }
  }

  resetCustomColors() {
    const wrapper = document.querySelector('.dashboard-wrapper') as HTMLElement;
    if (wrapper) this.customizableColors.forEach(c => wrapper.style.removeProperty(c.var));
    this.syncColorPickers(this.currentTheme);
  }
  
  toggleColorMenu() { this.isColorMenuOpen = !this.isColorMenuOpen; }

  user$!: Observable<any>;
  public apiRoot = environment.apiUrl.replace('/api', '');

  allData: DashboardPriceItem[] = [];
  madenList: DashboardPriceItem[] = [];    
  dovizList: DashboardPriceItem[] = [];    
  bilezikList: DashboardPriceItem[] = [];  
  ataResatList: DashboardPriceItem[] = []; 
  krediList: DashboardPriceItem[] = [];    

  categoryNameMap: { [key: number]: string } = {}; 

  // 🔥 Filtreleme Haritası (KATEGORİ_ÜRÜNADI formatında)
  productVisibilityMap: Map<string, boolean> = new Map();
  isConfigLoaded = false;

  currentTime = new Date();
  isTvMode = false;
  currentTheme: ThemeType = 'light';

  private subs: Subscription[] = [];
  private timeInterval: any;
  private logoutTimer: any;

  ngOnInit(): void {
    const savedTheme = localStorage.getItem('dashboard_theme') as ThemeType;
    if (savedTheme) { this.setTheme(savedTheme); } else { this.setTheme('light'); }

    this.user$ = this.store.select(getUser);

    this.loadCategories();
    this.loadProductConfigurations();

    this.goldHub.startConnection();

    // SignalR Veri Akışı
    const priceSub = this.goldHub.prices$.subscribe(data => {
      if (data && data.length > 0) {
        this.ngZone.run(() => {
            const incomingData = data as DashboardPriceItem[];
            this.processData(incomingData);
        });
      }
    });
    this.subs.push(priceSub);

    this.startClock();
    this.initAutoLogout();
  }

  // 🔥 1. YENİ: Benzersiz Anahtar Oluşturucu
  private generateUniqueKey(category: string, name: string): string {
      const cat = category ? category.trim().toUpperCase() : '';
      const prod = name ? name.trim().toUpperCase() : '';
      return `${cat}_${prod}`; // Örn: MADEN_HAS ALTIN
  }

  // 🔥 2. GÜNCEL: Ayarları Benzersiz Anahtarla Kaydet
  loadProductConfigurations() {
    this.settingsService.getProducts().subscribe({
        next: (products) => {
            this.productVisibilityMap.clear();
            products.forEach(p => {
                if (p.name && p.categoryName) {
                    const uniqueKey = this.generateUniqueKey(p.categoryName, p.name);
                    this.productVisibilityMap.set(uniqueKey, p.showOnWeb);
                }
            });
            this.isConfigLoaded = true;
            this.refreshCurrentLists();
        },
        error: (err) => console.error("Ürün ayarları yüklenemedi", err)
    });
  }

  // 🔥 3. GÜNCEL: Listeleri Benzersiz Anahtarla Temizle
  refreshCurrentLists() {
      const cleanList = (list: DashboardPriceItem[]) => {
          for (let i = list.length - 1; i >= 0; i--) {
              const key = this.generateUniqueKey(list[i].category, list[i].symbol);
              const isVisible = this.productVisibilityMap.has(key) 
                                ? this.productVisibilityMap.get(key) 
                                : true; 

              if (isVisible === false) {
                  list.splice(i, 1);
              }
          }
      };

      cleanList(this.madenList);
      cleanList(this.dovizList);
      cleanList(this.bilezikList);
      cleanList(this.ataResatList);
      cleanList(this.krediList);
      cleanList(this.allData);
      
      this.cdr.detectChanges();
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(res => {
      res.forEach(cat => {
        this.categoryNameMap[cat.orderIndex] = cat.name.toUpperCase();
      });
    });
  }

  getCategoryName(orderIndex: number, defaultName: string): string {
    return this.categoryNameMap[orderIndex] || defaultName;
  }

  // 🔥 4. GÜNCEL: İşleme ve Filtreleme
  processData(data: DashboardPriceItem[]) {
    for (const item of data) {
      
      // Benzersiz anahtar ile kontrol et
      const uniqueKey = this.generateUniqueKey(item.category, item.symbol);

      if (this.isConfigLoaded) {
         const showOnWeb = this.productVisibilityMap.has(uniqueKey) 
                           ? this.productVisibilityMap.get(uniqueKey) 
                           : true;
         
         if (showOnWeb === false) {
             continue; // Gösterme
         }
      }

      this.updateList(this.allData, item);

      let targetList: DashboardPriceItem[] | null = null;

      switch (item.categoryIndex) {
        case 1: targetList = this.madenList; break;
        case 2: targetList = this.dovizList; break;
        case 3: targetList = this.bilezikList; break;
        case 4: targetList = this.ataResatList; break;
        case 5: targetList = this.krediList; break;
        default: 
           // Fallback
           if (item.category === 'Maden') targetList = this.madenList;
           else if (item.category === 'Döviz') targetList = this.dovizList;
           else targetList = this.madenList; 
           break;
      }

      if (targetList) {
        this.updateList(targetList, item);
      }
    }
  }

  // 🔥 5. KRİTİK GÜNCELLEME: Listede ararken Kategoriye de bak!
  updateList(list: DashboardPriceItem[], newItem: DashboardPriceItem) {
    // Sadece sembol yetmez, kategori de tutmalı!
    const existingItem = list.find(x => 
        x.symbol === newItem.symbol && x.category === newItem.category
    );

    if (existingItem) {
      const oldAsk = existingItem.ask || 0;
      const oldBid = existingItem.bid || 0;
      const newAsk = newItem.ask || 0;
      const newBid = newItem.bid || 0;

      existingItem.bid = newBid;
      existingItem.ask = newAsk;
      existingItem.timestamp = newItem.timestamp;
      existingItem.description = newItem.description;

      if (newAsk !== oldAsk || newBid !== oldBid) {
        
        if (existingItem.flashTimeout) clearTimeout(existingItem.flashTimeout);

        if (newAsk > oldAsk) {
          existingItem.direction = 'up';
          existingItem.flashCss = 'text-flash-up';
        } else if (newAsk < oldAsk) {
          existingItem.direction = 'down';
          existingItem.flashCss = 'text-flash-down';
        }

        this.cdr.detectChanges();

        existingItem.flashTimeout = setTimeout(() => {
          existingItem.flashCss = '';
          this.cdr.detectChanges();
        }, 400);
      } else {
          this.cdr.detectChanges();
      }
    } else {
      newItem.direction = 'stable';
      newItem.flashCss = '';
      list.push(newItem);
      this.cdr.detectChanges();
    }
  }

  trackBySymbol(index: number, item: DashboardPriceItem): string {
    // TrackBy için de unique key kullanmak daha güvenli olabilir ama
    // şimdilik symbol yeterli olabilir eğer listeler ayrıysa.
    // Garanti olsun diye unique yapalım:
    return item.category + '_' + item.symbol;
  }

  initAutoLogout() {
    const user = this.authService.user;
    const isViewer = user?.roles?.some(r => r.toLowerCase() === 'viewer');

    if (isViewer) {
      const token = this.authService.session;
      if (!token) return;

      try {
        const decoded: any = jwtDecode(token);
        const expTimestamp = decoded.exp;

        if (expTimestamp) {
          const expirationDate = new Date(expTimestamp * 1000);
          const now = new Date();
          const timeLeft = expirationDate.getTime() - now.getTime();

          if (timeLeft > 0) {
            this.logoutTimer = setTimeout(() => {
              this.handleExpiration();
            }, timeLeft);
          } else {
            this.handleExpiration();
          }
        }
      } catch (error) {
        console.error('Token decode hatası:', error);
      }
    }
  }

  handleExpiration() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }

  setTheme(theme: ThemeType) {
    this.currentTheme = theme;
    localStorage.setItem('dashboard_theme', theme);
    this.resetCustomColors();
    this.syncColorPickers(theme);
    this.cdr.detectChanges();
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
    if (this.logoutTimer) clearTimeout(this.logoutTimer);
    this.goldHub.stopConnection();
  }
}