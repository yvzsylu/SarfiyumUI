import { Component, OnInit, OnDestroy, inject, Inject, CUSTOM_ELEMENTS_SCHEMA, HostListener, ChangeDetectorRef } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { Store } from '@ngrx/store';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap'; // Dropdown için

import { GoldHubService } from './services/gold-hub.service';
import { getUser } from '@store/authentication/authentication.selector';
import { PriceData } from '@/app/core/models/price-data.model';
import { environment } from '@environment/enviroment';

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
  private goldHub = inject(GoldHubService);
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

  user$!: Observable<any>;
  public apiRoot = environment.apiUrl.replace('/api', '');

  allData: DashboardPriceItem[] = [];
  madenList: DashboardPriceItem[] = [];
  dovizList: DashboardPriceItem[] = [];
  bilezikList: DashboardPriceItem[] = [];
  krediList: DashboardPriceItem[] = [];

  currentTime = new Date();
  isTvMode = false;
  
  // Yeni Tema Yönetimi
  currentTheme: ThemeType = 'light';
  
  private subs: Subscription[] = [];
  private timeInterval: any;

  ngOnInit(): void {
    // Kayıtlı temayı yükle
    const savedTheme = localStorage.getItem('theme') as ThemeType;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('light'); // Varsayılan
    }

    this.user$ = this.store.select(getUser);
    this.goldHub.startConnection();

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
  }

  // Tema Değiştirme Fonksiyonu
  setTheme(theme: ThemeType) {
    this.currentTheme = theme;
    localStorage.setItem('theme', theme);
    // HTML tag'ine attribute ekle: <html data-theme="dark">
    this.document.documentElement.setAttribute('data-theme', theme);
    
    // Bootstrap dark mode desteği için (Tooltip vb. için gerekli olabilir)
    if(theme === 'dark' || theme === 'financial') {
        this.document.documentElement.setAttribute('data-bs-theme', 'dark');
    } else {
        this.document.documentElement.setAttribute('data-bs-theme', 'light');
    }
  }

  processData(data: DashboardPriceItem[]) {
    data.forEach(item => {
      let targetList: DashboardPriceItem[] = this.madenList;
      switch (item.category) {
        case 'Maden': targetList = this.madenList; break;
        case 'Döviz': targetList = this.dovizList; break;
        case 'Bilezik': targetList = this.bilezikList; break;
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
        }, 300);
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
    this.goldHub.stopConnection();
  }
}