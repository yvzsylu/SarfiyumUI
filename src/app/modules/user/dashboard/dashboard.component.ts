import { Component, OnInit, OnDestroy, inject, Inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable, Subscription, tap } from 'rxjs';
import { Store } from '@ngrx/store';

import { GoldHubService } from './services/gold-hub.service';
import { getUser } from '@store/authentication/authentication.selector';
import { PriceData } from '@/app/core/models/price-data.model';
import { environment } from '@environment/enviroment';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UserDashboardComponent implements OnInit, OnDestroy {
  private goldHub = inject(GoldHubService);
  private store = inject(Store);
  private router = inject(Router);

  constructor(@Inject(DOCUMENT) private document: Document) {
    this.isTvMode = this.router.url.includes('/tv/');
  }

  // State
  user$!: Observable<any>;
  public apiRoot = environment.apiUrl.replace('/api', '');

  // Data
  allData: PriceData[] = [];
  goldList: PriceData[] = [];
  sarrafiyeList: PriceData[] = [];
  dovizList: PriceData[] = [];
  private previousPrices: { [key: string]: number } = {};

  // UI
  currentTime = new Date();
  isTvMode = false;
  isDarkMode = false;

  // Converter
  convertAmount: number = 1;
  selectedSymbol: string = '';
  convertResult: number = 0;

  private subs: Subscription[] = [];
  private timeInterval: any;

  ngOnInit(): void {
    // Theme Check
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      this.isDarkMode = true;
      this.document.documentElement.setAttribute('data-bs-theme', 'dark');
    }

    this.user$ = this.store.select(getUser);
    this.goldHub.startConnection();

    const priceSub = this.goldHub.prices$.subscribe(data => {
      if (data && data.length > 0) {
        this.allData = data;
        this.processData(data);

        if (!this.selectedSymbol && this.goldList.length > 0) {
          this.selectedSymbol = this.goldList[0].symbol;
          this.calculateConverter();
        }
      }
    });
    this.subs.push(priceSub);

    this.startClock();
  }

  processData(data: PriceData[]) {
    data.forEach(item => {
      this.calculateDirection(item); // Yönünü belirle

      // Hangi kategoriye ait?
      if (item.category === 'MADEN' || item.category === 'GRAM ALTIN' || item.symbol.includes('ALTIN')) {
        this.updateList(this.goldList, item);
      }
      else if (item.category === 'SARRAFIYE' || item.category === 'ZİYNET' || item.category === 'DARPHANE') {
        this.updateList(this.sarrafiyeList, item);
      }
      else if (item.category === 'DÖVİZ' || item.category === 'PARİTE' || item.symbol.includes('USD') || item.symbol.includes('EUR')) {
        this.updateList(this.dovizList, item);
      }
    });
  }

  updateList(list: PriceData[], newItem: PriceData) {
    const existingItem = list.find(x => x.symbol === newItem.symbol);

    if (existingItem) {
      // Varsa SADECE değerlerini güncelle (Referansı bozma)
      existingItem.bid = newItem.bid;
      existingItem.ask = newItem.ask;
      existingItem.timestamp = newItem.timestamp;
      existingItem.direction = newItem.direction; // Flash efekti için
    } else {
      // Yoksa listeye ekle
      list.push(newItem);
    }
  }

  trackBySymbol(index: number, item: PriceData): string {
    return item.symbol; // Sembol (ID) değişmediyse satırı yeniden çizme
  }

  calculateDirection(item: PriceData) {
    const prevAsk = this.previousPrices[item.symbol];
    if (prevAsk) {
      if (item.ask! > prevAsk) item.direction = 'up';
      else if (item.ask! < prevAsk) item.direction = 'down';
      else item.direction = 'stable';
    } else {
      item.direction = 'stable';
    }
    if (item.ask) this.previousPrices[item.symbol] = item.ask;
  }

  calculateConverter() {
    const item = this.allData.find(x => x.symbol === this.selectedSymbol);
    if (item && item.ask) {
      this.convertResult = this.convertAmount * item.ask;
    } else {
      this.convertResult = 0;
    }
  }

  startClock() {
    this.timeInterval = setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    const theme = this.isDarkMode ? 'dark' : 'light';
    this.document.documentElement.setAttribute('data-bs-theme', theme);
    localStorage.setItem('theme', theme);
  }

  toggleTvMode() {
    const currentUrl = this.router.url;
    if (this.isTvMode) {
      const newUrl = currentUrl.replace('/tv', '');
      this.exitFullScreen();
      this.router.navigateByUrl(newUrl);
      this.isTvMode = false;
    } else {
      const newUrl = '/tv' + currentUrl;
      this.enterFullScreen();
      this.router.navigateByUrl(newUrl);
      this.isTvMode = true;
    }
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