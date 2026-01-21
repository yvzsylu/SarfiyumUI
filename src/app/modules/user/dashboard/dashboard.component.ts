import { Component, OnInit, OnDestroy, inject, Inject, CUSTOM_ELEMENTS_SCHEMA, HostListener, ChangeDetectorRef, NgZone, AfterViewInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { jwtDecode } from 'jwt-decode';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

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

// UI Ayarlarını tutacak arayüz
interface UiSetting {
  fontSize?: number;
  fontWeight?: number; // YENİ: Boolean isBold yerine sayısal ağırlık
}

type ThemeType = 'custom' | 'light' | 'dark' | 'financial' | 'flat-light' | 'flat-dark' | 'flat-financial';

const CUSTOM_COLORS_STORAGE_KEY = 'dashboard_custom_colors_config';
const UI_SETTINGS_STORAGE_KEY = 'dashboard_ui_settings';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DatePipe, NgbDropdownModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserDashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  private goldHub = inject(GoldHubService);
  private authService = inject(AuthenticationService);
  private categoryService = inject(CategoryService);
  private settingsService = inject(SettingsService);
  private store = inject(Store);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private sanitizer = inject(DomSanitizer);

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

  // --- TEMA VE RENK TANIMLAMALARI ---
  themeDefaults: any = {
    'flat-light': {
        '--bg-body': '#ffffff', '--bg-card': '#ffffff', '--bg-header': '#ffffff', '--bg-ticker': '#f8f9fa',
        '--item-description-bg-odd': '#ffffff', '--item-description-bg-even': '#ffffff', 
        '--table-head-row-text': '#212529', '--text-title': '#212529',
        '--text-main': '#000000', '--text-muted': '#6c757d', '--text-th': '#212529',
        '--border-color': '#e9ecef', '--border-subtle': '#e9ecef',
        '--icon-bg': '#f0f0f0', '--icon-border': '#e0e0e0',
        '--card-header-bg': '#e9ecef', '--card-header-border': '#e9ecef', '--table-head-row-bg': '#e9ecef',
        '--bg-doviz-card': '#ffffff', '--border-doviz-card': '#e9ecef',
    },
    'flat-dark': {
        '--bg-body': '#000000', '--bg-card': '#000000', '--bg-header': '#000000', '--bg-ticker': '#111111',
        '--item-description-bg-odd': '#000000', '--item-description-bg-even': '#000000', 
        '--table-head-row-text': '#e0e0e0', '--text-title': '#ffffff',
        '--text-main': '#e0e0e0', '--text-muted': '#888888', '--text-th': '#b0b0b0',
        '--border-color': '#333333', '--border-subtle': '#333333',
        '--icon-bg': '#222222', '--icon-border': '#333333',
        '--card-header-bg': '#1a1a1a', '--card-header-border': '#333333', '--table-head-row-bg': '#1a1a1a',
        '--bg-doviz-card': '#121212', '--border-doviz-card': '#333333',
    },
    'flat-financial': {
        '--bg-body': '#060d17', '--bg-card': '#060d17', '--bg-header': '#060d17', '--bg-ticker': '#0b1a33',
        '--item-description-bg-odd': '#060d17', '--item-description-bg-even': '#060d17', 
        '--table-head-row-text': '#ffffff', '--text-title': '#ffffff',
        '--text-main': '#ffffff', '--text-muted': '#8fa6d1', '--text-th': '#ffffff',
        '--border-color': '#1e3a6e', '--border-subtle': '#1e3a6e',
        '--icon-bg': '#0f2242', '--icon-border': '#1e3a6e',
        '--card-header-bg': '#0f2242', '--card-header-border': '#1e3a6e', '--table-head-row-bg': '#0f2242',
        '--bg-doviz-card': '#0d1f3a', '--border-doviz-card': '#1e3a6e',
    },
    light: {
      '--bg-body': '#F7F7F7', '--bg-card': '#EEEDED', '--bg-header': '#EEEDED', '--bg-ticker': '#EEEDED',
      '--item-description-bg-odd': '#f1cc27', '--item-description-bg-even': '#f1cc27', 
      '--table-head-row-text': '#F9F8F6', '--text-title': '#F9F8F6',
      '--text-main': '#000000', '--text-muted': '#6c757d', '--text-th': '#666666',
      '--border-color': '#d6d6d6', '--border-subtle': '#d6d6d6', 
      '--icon-bg': '#c2c2c2', '--icon-border': '#c2c2c2',
      '--card-header-bg': '#313647', '--card-header-border': '#313647', '--table-head-row-bg': '#313647',
      '--bg-doviz-card': '#EEEDED', '--border-doviz-card': '#d6d6d6',
    },
    dark: {
      '--bg-body': '#121212', '--bg-card': '#222831', '--bg-header': '#222831', '--bg-ticker': '#222831',
      '--item-description-bg-odd': '#393E46', '--item-description-bg-even': '#393E46', 
      '--table-head-row-text': '#EEEEEE', '--text-title': '#EEEEEE',
      '--text-main': '#e0e0e0', '--text-muted': '#a0a0a0', '--text-th': '#888888',
      '--border-color': '#333333', '--border-subtle': '#333333',
      '--icon-bg': '#393E46', '--icon-border': '#393E46',
      '--card-header-bg': '#5d543b', '--card-header-border': '#5d543b', '--table-head-row-bg': '#5d543b',
      '--bg-doviz-card': '#222831', '--border-doviz-card': '#333333',
    },
    financial: {
      '--bg-body': '#132240', '--bg-card': '#132240', '--bg-header': '#0f2242', '--bg-ticker': '#162a52',
      '--item-description-bg-odd': '#374f79', '--item-description-bg-even': '#374f79', 
      '--table-head-row-text': '#F9F5EB', '--text-title': '#F9F5EB',
      '--text-main': '#ffffff', '--text-muted': '#8fa6d1', '--text-th': '#7b96c4',
      '--border-color': '#1e3a6e', '--border-subtle': '#1e3a6e',
      '--icon-bg': '#0F2854', '--icon-border': '#0F2854',
      '--card-header-bg': '#4988C4', '--card-header-border': '#4988C4', '--table-head-row-bg': '#4988C4',
      '--bg-doviz-card': '#132240', '--border-doviz-card': '#1e3a6e',
    },
    custom: {} 
  };

  customizableColors = [
    { label: 'Sayfa Arkaplan', var: '--bg-body', value: '#ffffff' },
    { label: 'Kart Arkaplan', var: '--bg-card', value: '#ffffff' },
    { label: 'Döviz Kart Arkaplan', var: '--bg-doviz-card', value: '#ffffff' }, 
    { label: 'Döviz Kart Çerçeve', var: '--border-doviz-card', value: '#e9ecef' }, 
    { label: 'Header Arkaplan', var: '--bg-header', value: '#ffffff' },
    { label: 'Kayan Bant (Ticker)', var: '--bg-ticker', value: '#f8f9fa' },
    { label: 'Ana Yazı Rengi', var: '--text-main', value: '#000000' },
    { label: 'İkincil Yazı (Saat sn)', var: '--text-muted', value: '#6c757d' },
    { label: 'Kart Başlık Yazısı', var: '--text-title', value: '#212529' },
    { label: 'Tablo Başlık Yazısı', var: '--table-head-row-text', value: '#212529' },
    { label: 'Tablo Sütun Başlığı (TH)', var: '--text-th', value: '#212529' },
    { label: 'Genel Çerçeve', var: '--border-color', value: '#e9ecef' },
    { label: 'Tablo/Satır Çizgileri', var: '--border-subtle', value: '#e9ecef' },
    { label: 'Ürün Açıklama (Tek)', var: '--item-description-bg-odd', value: '#ffffff' },
    { label: 'Ürün Açıklama (Çift)', var: '--item-description-bg-even', value: '#ffffff' },
    { label: 'İkon Arkaplan', var: '--icon-bg', value: '#f0f0f0' },
    { label: 'İkon Çerçeve', var: '--icon-border', value: '#e0e0e0' },
    { label: 'Kart Başlık Bg', var: '--card-header-bg', value: '#e9ecef' },
    { label: 'Kart Başlık Çerçeve', var: '--card-header-border', value: '#e9ecef' },
    { label: 'Tablo Başlık Bg', var: '--table-head-row-bg', value: '#e9ecef' },
  ];
  
  isColorMenuOpen = false;
  showSaveSuccess = false;

  // --- UI AYARLARI (FONT SIZE & WEIGHT) ---
  uiSettings: { [key: string]: UiSetting } = {};

  updateCustomColor(cssVar: string, event: any) {
    const newValue = event.target.value;
    const colorItem = this.customizableColors.find(c => c.var === cssVar);
    if (colorItem) colorItem.value = newValue;

    const wrapper = document.querySelector('.dashboard-wrapper') as HTMLElement;
    if (wrapper) wrapper.style.setProperty(cssVar, newValue);
  }

  saveCustomTheme() {
      localStorage.setItem(CUSTOM_COLORS_STORAGE_KEY, JSON.stringify(this.customizableColors));
      this.currentTheme = 'custom';
      localStorage.setItem('dashboard_theme', 'custom');

      this.loadAndApplyCustomColors();

      this.showSaveSuccess = true;
      setTimeout(() => {
          this.showSaveSuccess = false;
          this.cdr.detectChanges();
      }, 3000);
  }

  loadAndApplyCustomColors() {
      const saved = localStorage.getItem(CUSTOM_COLORS_STORAGE_KEY);
      if (saved) {
          try {
              const savedColors: any[] = JSON.parse(saved);
              const wrapper = document.querySelector('.dashboard-wrapper') as HTMLElement;
              
              if (savedColors && Array.isArray(savedColors)) {
                  savedColors.forEach(savedItem => {
                      const currentItem = this.customizableColors.find(c => c.var === savedItem.var);
                      if (currentItem) {
                          currentItem.value = savedItem.value;
                      }
                  });

                  if (this.currentTheme === 'custom' && wrapper) {
                      this.customizableColors.forEach(c => {
                          if (c.value) {
                              wrapper.style.setProperty(c.var, c.value);
                          }
                      });
                  }
              }
          } catch (e) {
              console.error('Renk ayarları yüklenirken hata:', e);
          }
      }
  }

  setTheme(theme: ThemeType, resetColors = true) {
    if (theme === 'custom') {
        this.currentTheme = 'custom';
        this.loadAndApplyCustomColors();
        localStorage.setItem('dashboard_theme', 'custom');
    } else {
        this.currentTheme = theme;
        localStorage.setItem('dashboard_theme', theme);
        
        const wrapper = document.querySelector('.dashboard-wrapper') as HTMLElement;
        if (wrapper) {
            this.customizableColors.forEach(c => wrapper.style.removeProperty(c.var));
        }
        
        const currentDefaults = this.themeDefaults[theme];
        if (currentDefaults) {
            this.customizableColors.forEach(colorItem => {
                if(currentDefaults[colorItem.var]) {
                    colorItem.value = currentDefaults[colorItem.var];
                }
            });
        }
    }
    
    this.cdr.detectChanges();
  }

  resetCustomColors() {
    localStorage.removeItem(CUSTOM_COLORS_STORAGE_KEY);
    this.setTheme('flat-light');
  }
  
  toggleColorMenu() { this.isColorMenuOpen = !this.isColorMenuOpen; }

  // --- UI PERSISTENCE LOGIC (LOCAL STORAGE) ---

  loadUiSettings() {
    const stored = localStorage.getItem(UI_SETTINGS_STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        
        // MIGRATION: Eğer eski versiyondan kalma 'isBold' (boolean) varsa, number'a çevir
        Object.keys(parsed).forEach(key => {
            if (typeof parsed[key].isBold === 'boolean') {
                parsed[key].fontWeight = parsed[key].isBold ? 700 : 400;
                delete parsed[key].isBold;
            }
        });
        
        this.uiSettings = parsed;
      } catch (e) {
        console.error('UI Ayarları yüklenirken hata', e);
      }
    }
  }

  saveUiSettings() {
    localStorage.setItem(UI_SETTINGS_STORAGE_KEY, JSON.stringify(this.uiSettings));
  }

  // HTML tarafında [style] binding için kullanılır. 
  getWrapperStyle(key: string, defaultSize?: number): SafeStyle {
    const setting = this.uiSettings[key];
    let styleStr = '';

    if (setting && setting.fontSize) {
      styleStr += `font-size: ${setting.fontSize}px !important;`;
    }

    if (setting && setting.fontWeight) {
      styleStr += `font-weight: ${setting.fontWeight} !important;`;
    }

    return this.sanitizer.bypassSecurityTrustStyle(styleStr);
  }

  // --- FONT RESIZE ACTION ---
  adjustFontSize(event: MouseEvent, step: number) {
    event.stopPropagation();
    event.preventDefault();

    const wrapper = (event.target as HTMLElement).closest('.resizable-wrapper') as HTMLElement;
    
    if (wrapper) {
      const key = wrapper.getAttribute('data-key');
      if (!key) return; 

      const style = window.getComputedStyle(wrapper);
      const currentSize = parseFloat(style.fontSize);
      const newSize = Math.max(6, currentSize + step);

      if (!this.uiSettings[key]) this.uiSettings[key] = {};
      this.uiSettings[key].fontSize = newSize;

      this.saveUiSettings();
      wrapper.style.setProperty('font-size', `${newSize}px`, 'important');
    }
  }

  // --- FONT WEIGHT ADJUST ACTION (YENİ) ---
  adjustFontWeight(event: MouseEvent, step: number) {
    event.stopPropagation();
    event.preventDefault();

    const wrapper = (event.target as HTMLElement).closest('.resizable-wrapper') as HTMLElement;

    if (wrapper) {
      const key = wrapper.getAttribute('data-key');
      if (!key) return;

      const style = window.getComputedStyle(wrapper);
      let currentWeightStr = style.fontWeight;
      
      // String değerleri sayıya çevir
      let currentWeight = 400; // Varsayılan normal
      
      if (currentWeightStr === 'bold') currentWeight = 700;
      else if (currentWeightStr === 'normal') currentWeight = 400;
      else if (currentWeightStr === 'lighter') currentWeight = 100;
      else if (currentWeightStr === 'bolder') currentWeight = 900;
      else {
          const parsed = parseInt(currentWeightStr, 10);
          if (!isNaN(parsed)) currentWeight = parsed;
      }

      // Yeni değeri hesapla (100 ile 900 arasında sınırla)
      let newWeight = currentWeight + step;
      if (newWeight < 100) newWeight = 100;
      if (newWeight > 900) newWeight = 900;

      if (!this.uiSettings[key]) this.uiSettings[key] = {};
      this.uiSettings[key].fontWeight = newWeight;

      this.saveUiSettings();
      
      wrapper.style.setProperty('font-weight', newWeight.toString(), 'important');
    }
  }

  user$!: Observable<any>;
  public apiRoot = environment.apiUrl.replace('/api', '');

  allData: DashboardPriceItem[] = [];
  madenList: DashboardPriceItem[] = [];    
  dovizList: DashboardPriceItem[] = [];    
  bilezikList: DashboardPriceItem[] = [];  
  ataResatList: DashboardPriceItem[] = []; 
  krediList: DashboardPriceItem[] = [];    

  categoryNameMap: { [key: number]: string } = {}; 

  productVisibilityMap: Map<string, boolean> = new Map();
  isConfigLoaded = false;

  currentTime = new Date();
  isTvMode = false;
  currentTheme: ThemeType = 'flat-light';

  private subs: Subscription[] = [];
  private timeInterval: any;
  private logoutTimer: any;

  ngOnInit(): void {
    this.loadUiSettings(); 

    const savedTheme = localStorage.getItem('dashboard_theme') as ThemeType;
    const savedColors = localStorage.getItem(CUSTOM_COLORS_STORAGE_KEY);
    
    if(savedColors) {
        try {
            const parsedColors = JSON.parse(savedColors);
            parsedColors.forEach((savedItem: any) => {
                const currentItem = this.customizableColors.find(c => c.var === savedItem.var);
                if (currentItem) {
                    currentItem.value = savedItem.value;
                }
            });
        } catch(e) {}
    }

    if (savedTheme) { 
        this.setTheme(savedTheme, false); 
    } else { 
        this.setTheme('flat-light', false); 
    }

    this.user$ = this.store.select(getUser);

    this.loadCategories();
    this.loadProductConfigurations();

    this.goldHub.startConnection();

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

  ngAfterViewInit(): void {
      if (this.currentTheme === 'custom') {
          setTimeout(() => {
              this.loadAndApplyCustomColors();
          }, 100);
      }
  }

  private generateUniqueKey(category: string, name: string): string {
      const cat = category ? category.trim().toLocaleUpperCase('tr-TR') : '';
      const prod = name ? name.trim().toLocaleUpperCase('tr-TR') : '';
      return `${cat}_${prod}`; 
  }

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
        this.categoryNameMap[cat.orderIndex] = cat.name.toLocaleUpperCase('tr-TR');
      });
    });
  }

  getCategoryName(orderIndex: number, defaultName: string): string {
    return this.categoryNameMap[orderIndex] || defaultName;
  }

  processData(data: DashboardPriceItem[]) {
    for (const item of data) {
      const uniqueKey = this.generateUniqueKey(item.category, item.symbol);

      if (this.isConfigLoaded) {
         const showOnWeb = this.productVisibilityMap.has(uniqueKey) 
                           ? this.productVisibilityMap.get(uniqueKey) 
                           : true;
         if (showOnWeb === false) continue; 
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

  updateList(list: DashboardPriceItem[], newItem: DashboardPriceItem) {
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