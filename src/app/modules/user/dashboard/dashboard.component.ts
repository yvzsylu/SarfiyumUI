import { Component, OnInit, OnDestroy, inject, Inject, CUSTOM_ELEMENTS_SCHEMA, HostListener, ChangeDetectorRef, NgZone, AfterViewInit, ChangeDetectionStrategy } from '@angular/core';
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
import { AppVersionService } from '@/app/core/services/app-version.service';

// 🔥 EKLENEN API SERVİSİ (Yolunu projene göre düzenle)
import { ThemeSettingsService } from './services/theme-settings.service';

// categoryIndex artık PriceData'nın zorunlu bir alanı (sunucu her zaman gönderiyor),
// bu yüzden burada tekrar tanımlanmıyor. Buradakiler yalnızca ekrana ait alanlar.
//
// Alış ve satış AYRI takip edilir. Tek bir `direction`/`flashCss` alanı vardı ve yönü
// yalnızca satış fiyatına bakarak belirliyordu; alış tarafındaki hareket görünmüyordu
// (bulgu W14). Alış çarpanını büyütüp fiyatı iki katına çıkarmak bile, satış o an
// oynamadığı sürece ekranda AŞAĞI ok gösteriyordu.
interface DashboardPriceItem extends PriceData {
  /** Alış hücresinin yönü ve flash sınıfı. */
  bidDirection?: 'up' | 'down' | 'stable';
  bidFlashCss?: string;

  /** Satış hücresinin yönü ve flash sınıfı. */
  askDirection?: 'up' | 'down' | 'stable';
  askFlashCss?: string;
}

// UI Ayarlarını tutacak arayüz
interface UiSetting {
  fontSize?: number;
  fontWeight?: number; 
}

// 🔥 EKLENEN DTO ARAYÜZLERİ
export interface ThemeSettingsDto {
  dashboardTheme?: string;
  uiSettingsJson?: string;
  customColorsJson?: string;
}

type ThemeType = 'custom' | 'light' | 'dark' | 'financial' | 'flat-light' | 'flat-dark' | 'flat-financial';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DatePipe, NgbDropdownModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],

  // Bu ekran TV modunda saatlerce açık kalıyor ve saniyede bir fiyat paketi alıyor.
  // Varsayılan stratejide her paket, 700+ satırlık template'in tamamını yeniden
  // değerlendiriyordu — üstelik ürün başına ayrı ayrı (bulgu W1). OnPush ile change
  // detection yalnızca aşağıdaki markForCheck çağrılarında tetikleniyor.
  //
  // ⚠️ OnPush kuralı: template dışından (subscribe, setTimeout, setInterval) yapılan
  // her state değişikliğinden sonra markForCheck/detectChanges çağrılmalıdır.
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class UserDashboardComponent implements OnInit, OnDestroy, AfterViewInit {

  private goldHub = inject(GoldHubService);
  private appVersion = inject(AppVersionService);

  /** Renk düzenleyici açıkken sürüm yenilemesini erteleyen kaydı geri çeker. */
  private releaseVersionBlock?: () => void;
  private authService = inject(AuthenticationService);
  private categoryService = inject(CategoryService);
  private themeSettingsApi = inject(ThemeSettingsService); // 🔥 API Inject Edildi
  private store = inject(Store);
  private router = inject(Router);
  private cdr = inject(ChangeDetectorRef);
  private ngZone = inject(NgZone);
  private sanitizer = inject(DomSanitizer);

  private saveTimeout: any; // 🔥 API İstek Limitleyici (Debounce)

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

  user$!: Observable<any>;
  public apiRoot = environment.apiUrl.replace('/api', '');

  // Ürünlerin TEK kaynağı. Aşağıdaki listeler bu nesnelerin referanslarını tutar,
  // yani kopya veri yoktur (bulgu W2) ve arama O(1)'dir (bulgu W3).
  private itemsById = new Map<string, DashboardPriceItem>();

  allData: DashboardPriceItem[] = [];
  madenList: DashboardPriceItem[] = [];
  dovizList: DashboardPriceItem[] = [];
  bilezikList: DashboardPriceItem[] = [];
  ataResatList: DashboardPriceItem[] = [];
  krediList: DashboardPriceItem[] = [];

  categoryNameMap: { [key: number]: string } = {};

  private flashClearTimer: any;

  currentTime = new Date();
  isTvMode = false;
  currentTheme: ThemeType = 'flat-light';

  private subs: Subscription[] = [];
  private timeInterval: any;
  private logoutTimer: any;

  ngOnInit(): void {
    // 🔥 Local Storage yerini API aldı
    this.loadSettingsFromDb();

    this.user$ = this.store.select(getUser);

    this.loadCategories();

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

    // Yeni sürüm yayınlandığında sayfayı kendiliğinden yenile.
    //
    // Sürüm takibi artık kök bileşende, uygulama genelinde çalışıyor. Burada yalnızca
    // "şu an yenileme" koşulumuzu bildiriyoruz: renk düzenleyici açıkken kullanıcı bir
    // şey düzenliyordur, sayfayı altından çekmek yaptığı değişikliği kaybettirir. TV'de
    // bu menü zaten hiç açılmaz, dolayısıyla asıl hedeflenen senaryo engellenmiş olmuyor.
    this.releaseVersionBlock = this.appVersion.blockWhile(() => this.isColorMenuOpen);
  }

  ngAfterViewInit(): void {
      if (this.currentTheme === 'custom') {
          setTimeout(() => {
              this.applyCustomColorsToDom();
          }, 100);
      }
  }

  // 🔥 DB'DEN AYARLARI ÇEKME
  loadSettingsFromDb() {
    this.themeSettingsApi.getThemeSettings().subscribe({
      next: (res: any) => {
        if (res.isSuccess && res.data) {
          
          // UI Font Ayarları
          if (res.data.uiSettingsJson) {
            try {
              const parsed = JSON.parse(res.data.uiSettingsJson);
              // Migration check
              Object.keys(parsed).forEach(key => {
                  if (typeof parsed[key].isBold === 'boolean') {
                      parsed[key].fontWeight = parsed[key].isBold ? 700 : 400;
                      delete parsed[key].isBold;
                  }
              });
              this.uiSettings = parsed;
            } catch (e) {
              console.error('UI Ayarları parse hatası', e);
            }
          }

          // Custom Renk Ayarları
          if (res.data.customColorsJson) {
            try {
              const savedColors: any[] = JSON.parse(res.data.customColorsJson);
              if (savedColors && Array.isArray(savedColors)) {
                  savedColors.forEach(savedItem => {
                      const currentItem = this.customizableColors.find(c => c.var === savedItem.var);
                      if (currentItem) {
                          currentItem.value = savedItem.value;
                      }
                  });
              }
            } catch (e) {
              console.error('Renk ayarları parse hatası', e);
            }
          }

          // Temayı Set Et
          const dbTheme = res.data.dashboardTheme || 'flat-light';
          this.setTheme(dbTheme as ThemeType, false, false); // triggerSave = false
          
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Ayarlar alınamadı', err)
    });
  }

  // 🔥 DB'YE AYARLARI KAYDETME
  syncSettingsToDb() {
    const user = this.authService.user;
    const isViewer = user?.roles?.some(r => r.toLowerCase() === 'viewer');
    
    // Viewer rolü kayıt atamaz
    if (isViewer) return;

    const payload: ThemeSettingsDto = {
      dashboardTheme: this.currentTheme,
      uiSettingsJson: JSON.stringify(this.uiSettings),
      customColorsJson: JSON.stringify(this.customizableColors)
    };

    this.themeSettingsApi.updateThemeSettings(payload).subscribe({
      error: (err) => console.error('Dashboard ayarları kaydedilemedi', err)
    });
  }

  updateCustomColor(cssVar: string, event: any) {
    const newValue = event.target.value;
    const colorItem = this.customizableColors.find(c => c.var === cssVar);
    if (colorItem) colorItem.value = newValue;

    const wrapper = document.querySelector('.dashboard-wrapper') as HTMLElement;
    if (wrapper) wrapper.style.setProperty(cssVar, newValue);
  }

  saveCustomTheme() {
      this.currentTheme = 'custom';
      this.applyCustomColorsToDom();
      
      this.syncSettingsToDb(); // 🔥 API Çağrısı

      this.showSaveSuccess = true;
      setTimeout(() => {
          this.showSaveSuccess = false;
          this.cdr.detectChanges();
      }, 3000);
  }

  // Eski loadAndApplyCustomColors metodu sadeleştirildi
  applyCustomColorsToDom() {
    const wrapper = document.querySelector('.dashboard-wrapper') as HTMLElement;
    if (this.currentTheme === 'custom' && wrapper) {
        this.customizableColors.forEach(c => {
            if (c.value) {
                wrapper.style.setProperty(c.var, c.value);
            }
        });
    }
  }

  setTheme(theme: ThemeType, resetColors = true, triggerSave = true) {
    this.currentTheme = theme;
    
    if (theme === 'custom') {
        this.applyCustomColorsToDom();
    } else {
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
    
    if (triggerSave) {
        this.syncSettingsToDb(); // 🔥 API Çağrısı
    }
    
    this.cdr.detectChanges();
  }

  resetCustomColors() {
    this.setTheme('flat-light');
  }
  
  toggleColorMenu() { this.isColorMenuOpen = !this.isColorMenuOpen; }

  // 🔥 YENİ: Debounce mekanizması ile API isteği atılır
  saveUiSettings() {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      this.syncSettingsToDb();
    }, 1500);
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

  adjustFontWeight(event: MouseEvent, step: number) {
    event.stopPropagation();
    event.preventDefault();

    const wrapper = (event.target as HTMLElement).closest('.resizable-wrapper') as HTMLElement;

    if (wrapper) {
      const key = wrapper.getAttribute('data-key');
      if (!key) return;

      const style = window.getComputedStyle(wrapper);
      let currentWeightStr = style.fontWeight;
      
      let currentWeight = 400; 
      
      if (currentWeightStr === 'bold') currentWeight = 700;
      else if (currentWeightStr === 'normal') currentWeight = 400;
      else if (currentWeightStr === 'lighter') currentWeight = 100;
      else if (currentWeightStr === 'bolder') currentWeight = 900;
      else {
          const parsed = parseInt(currentWeightStr, 10);
          if (!isNaN(parsed)) currentWeight = parsed;
      }

      let newWeight = currentWeight + step;
      if (newWeight < 100) newWeight = 100;
      if (newWeight > 900) newWeight = 900;

      if (!this.uiSettings[key]) this.uiSettings[key] = {};
      this.uiSettings[key].fontWeight = newWeight;

      this.saveUiSettings();
      
      wrapper.style.setProperty('font-weight', newWeight.toString(), 'important');
    }
  }

  loadCategories() {
    this.categoryService.getCategories().subscribe(res => {
      res.forEach(cat => {
        this.categoryNameMap[cat.orderIndex] = cat.name.toLocaleUpperCase('tr-TR');
      });
      // OnPush: template dışından gelen değişiklik, işaretlenmezse ekrana yansımaz.
      this.cdr.markForCheck();
    });
  }

  getCategoryName(orderIndex: number, defaultName: string): string {
    return this.categoryNameMap[orderIndex] || defaultName;
  }

  processData(data: DashboardPriceItem[]) {
    // Görünürlük filtresi (ShowOnWeb) artık SUNUCUDA uygulanıyor: bu listede zaten
    // yalnızca web'de görünmesi gereken ürünler var. Eskiden gizli ürünlerin fiyatları
    // da tel üzerinden gelip burada eleniyordu (bulgu W5) — hem gereksiz trafik hem de
    // gizlilik sızıntısıydı.
    //
    // Eskiden bu döngü ürün BAŞINA cdr.detectChanges() çağırıyordu (bulgu W1); ~30 ürün
    // × saniyede bir paket = saniyede 30 tam CD döngüsü. Artık tüm paket işlenip
    // sonunda TEK bir markForCheck yapılıyor.
    let membershipChanged = false;
    let anyFlash = false;

    for (const incoming of data) {
      const existing = this.itemsById.get(incoming.id);

      if (!existing) {
        // Yeni ürün: kendi kopyamızı oluşturuyoruz. Servisten gelen nesneyi doğrudan
        // tutmuyoruz, çünkü flash/direction gibi alanlar yalnızca ekrana ait.
        this.itemsById.set(incoming.id, {
          ...incoming,
          direction: 'stable',
          bidDirection: 'stable',
          askDirection: 'stable',
          bidFlashCss: '',
          askFlashCss: ''
        });
        membershipChanged = true;
        continue;
      }

      const oldAsk = existing.ask || 0;
      const oldBid = existing.bid || 0;
      const newAsk = incoming.ask || 0;
      const newBid = incoming.bid || 0;

      // Ad/kategori/sıra değiştiyse listelerin yeniden kurulması gerekir; sunucu bu
      // durumda zaten delta yerine tam liste gönderiyor.
      if (existing.symbol !== incoming.symbol ||
          existing.categoryIndex !== incoming.categoryIndex ||
          existing.orderIndex !== incoming.orderIndex) {
        membershipChanged = true;
      }

      existing.symbol = incoming.symbol;
      existing.category = incoming.category;
      existing.categoryIndex = incoming.categoryIndex;
      existing.orderIndex = incoming.orderIndex;
      existing.bid = newBid;
      existing.ask = newAsk;

      // Alış ve satış BİRBİRİNDEN BAĞIMSIZ değerlendirilir.
      //
      // Eskiden tek bir karar vardı ve yalnızca satışa bakıyordu:
      // `newAsk > oldAsk ? 'up' : 'down'`. İki ayrı hata üretiyordu — alıştaki hareket
      // hiç görünmüyordu, ayrıca satış HİÇ değişmediğinde ternary 'down' tarafına
      // düştüğü için yükselen bir alış fiyatı aşağı okla gösteriliyordu. Kuyumcu alış
      // çarpanını büyüttüğünde tam olarak bu yaşanıyordu (bulgu W14).
      if (newBid !== oldBid) {
        const yukseldi = newBid > oldBid;
        existing.bidDirection = yukseldi ? 'up' : 'down';
        existing.bidFlashCss = yukseldi ? 'text-flash-up' : 'text-flash-down';
        anyFlash = true;
      }

      if (newAsk !== oldAsk) {
        const yukseldi = newAsk > oldAsk;
        existing.askDirection = yukseldi ? 'up' : 'down';
        existing.askFlashCss = yukseldi ? 'text-flash-up' : 'text-flash-down';
        anyFlash = true;
      }

      // Döviz kartının kenarlığı satır geneline ait tek bir yön istiyor. Satış piyasa
      // tarafını temsil ettiği için önceliklidir; satış oynamadıysa alışa düşer.
      if (newAsk !== oldAsk) {
        existing.direction = newAsk > oldAsk ? 'up' : 'down';
      } else if (newBid !== oldBid) {
        existing.direction = newBid > oldBid ? 'up' : 'down';
      }
    }

    // Sunucudan artık gelmeyen ürünleri düşür (ürün silinmiş/gizlenmiş olabilir).
    if (data.length !== this.itemsById.size) {
      const liveIds = new Set(data.map(x => x.id));
      for (const id of Array.from(this.itemsById.keys())) {
        if (!liveIds.has(id)) this.itemsById.delete(id);
      }
      membershipChanged = true;
    }

    if (membershipChanged) this.rebuildLists();
    if (anyFlash) this.scheduleFlashClear();

    this.cdr.markForCheck();
  }

  /**
   * Kategori listelerini yeniden kurar. Listeler aynı nesnelerin REFERANSINI tutar,
   * bu yüzden fiyat güncellemeleri için yeniden kurmaya gerek yoktur — yalnızca ürün
   * kümesi ya da sırası değiştiğinde çağrılır.
   */
  private rebuildLists() {
    this.allData = Array.from(this.itemsById.values())
      .sort((a, b) => (a.orderIndex ?? 9999) - (b.orderIndex ?? 9999));

    this.madenList = [];
    this.dovizList = [];
    this.bilezikList = [];
    this.ataResatList = [];
    this.krediList = [];

    for (const item of this.allData) {
      switch (item.categoryIndex) {
        case 1: this.madenList.push(item); break;
        case 2: this.dovizList.push(item); break;
        case 3: this.bilezikList.push(item); break;
        case 4: this.ataResatList.push(item); break;
        case 5: this.krediList.push(item); break;
        default:
          // Kategori indeksi bilinmiyorsa ada göre tahmin et; hiçbiri tutmazsa
          // ürünün kaybolmaması için Maden listesine düşür.
          if (item.category === 'Döviz') this.dovizList.push(item);
          else this.madenList.push(item);
          break;
      }
    }
  }

  /**
   * Flash efektini TEK bir zamanlayıcıyla temizler.
   *
   * Eskiden her fiyat değişiminde ürün başına ayrı bir setTimeout kuruluyor ve her biri
   * ayrı bir detectChanges tetikliyordu (bulgu W4); yoğun akışta onlarca bekleyen timer
   * oluşuyordu. Artık aynı anda en fazla bir zamanlayıcı yaşar.
   */
  private scheduleFlashClear() {
    if (this.flashClearTimer) clearTimeout(this.flashClearTimer);

    this.flashClearTimer = setTimeout(() => {
      for (const item of this.itemsById.values()) {
        item.bidFlashCss = '';
        item.askFlashCss = '';
      }
      this.cdr.markForCheck();
    }, 400);
  }


  trackBySymbol(index: number, item: DashboardPriceItem): string {
    // Ürünün kalıcı kimliği. Ad değişse bile Angular satırı yeniden yaratmaz.
    return item.id;
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
    // Saat saniyede bir güncelleniyor. OnPush sayesinde bu artık tüm component ağacını
    // değil yalnızca bu component'i işaretliyor; fiyat akışıyla da çakışmıyor (bulgu W8).
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
      this.cdr.markForCheck();
    }, 1000);
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
    if (this.flashClearTimer) clearTimeout(this.flashClearTimer);
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.releaseVersionBlock?.();
    this.goldHub.stopConnection();
  }
}