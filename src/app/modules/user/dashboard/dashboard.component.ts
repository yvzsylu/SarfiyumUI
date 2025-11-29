import { Component, OnInit, OnDestroy, inject,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Observable, Subscription, tap } from 'rxjs';
import { Store } from '@ngrx/store';
import { GoldHubService } from './services/gold-hub.service'; // Yolunu kendine göre ayarla
import { getUser } from '@store/authentication/authentication.selector'; // Senin store yapın
import { PriceData } from '@/app/core/models/price-data.model'; // Modelin yeri (yolunu kontrol et)
import { environment } from '@environment/enviroment';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DatePipe],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'], // SCSS dosyasını bağladık
  schemas: [CUSTOM_ELEMENTS_SCHEMA]


})
export class UserDashboardComponent implements OnInit, OnDestroy {
  // Servisler
  private goldHub = inject(GoldHubService);
  private store = inject(Store);
  user$!: Observable<any>;

  // API Kök Dizini (Resimler için)
  // environment.apiUrl genelde "https://localhost:7140/api" şeklindedir.
  // Resimler root'ta (/uploads/...) olduğu için /api kısmını siliyoruz.
  public apiRoot = environment.apiUrl.replace('/api', '');
  // Veriler
  goldList: PriceData[] = [];
  sarrafiyeList: PriceData[] = [];
  allData: PriceData[] = [];
  
  // UI Değişkenleri
  currentTime = new Date();
  tenantLogo: string = 'assets/images/users/user-dummy-img.jpg'; // Default
  tenantName: string = '';

  // Çevirici
  convertAmount: number = 1;
  selectedSymbol: string = '';
  convertResult: number = 0;

  private subs: Subscription[] = [];

  ngOnInit(): void {
    // 1. SignalR Başlat
     this.user$ = this.store.select(getUser).pipe(
       tap(user => {
         // Debug için loglayabilirsin:
         // console.log('User Topbar Data:', user);
       })
     );
    this.goldHub.startConnection();

    // 2. Fiyatları Dinle
    const priceSub = this.goldHub.prices$.subscribe(data => {
      if (data.length > 0) {
        this.allData = data;
        this.categorizeData(data);
        
        // Çevirici için varsayılan seçim
        if (!this.selectedSymbol && this.goldList.length > 0) {
          this.selectedSymbol = this.goldList[0].symbol;
          this.calculateConverter();
        }
      }
    });
    this.subs.push(priceSub);

    // 3. User Bilgisini Store'dan Çek (Logo ve İsim için)
    const userSub = this.store.select(getUser).subscribe(user => {
      if (user) {
        // Senin User modelindeki alan adlarına göre düzenle
        // JWT içinde logoUrl varsa oradan da alabilirsin
        this.tenantName = user.fullName || 'Firma Adı'; 
        // this.tenantLogo = user.tenantLogoUrl || this.tenantLogo; 
      }
    });
    this.subs.push(userSub);

    // 4. Saat
    setInterval(() => {
      this.currentTime = new Date();
    }, 1000);
  }

  categorizeData(data: PriceData[]) {
    // Harem Altın Mantığı: Sol Taraf (Has Altın, Ons vb.)
    this.goldList = data.filter(d => 
      d.category === 'MADEN' || d.category === 'GRAM ALTIN' || d.symbol.includes('ALTIN')
    );

    // Sağ Taraf (Çeyrek, Yarım, Ata vb.)
    this.sarrafiyeList = data.filter(d => 
      d.category === 'SARRAFIYE' || d.category === 'ZİYNET' || d.category === 'DARPHANE'
    );
  }

  calculateConverter() {
    const item = this.allData.find(x => x.symbol === this.selectedSymbol);
    if (item && item.ask) {
      this.convertResult = this.convertAmount * item.ask;
    } else {
      this.convertResult = 0;
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }
}