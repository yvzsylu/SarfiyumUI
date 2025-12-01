import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; 
import { SettingsService, TenantSettingDto, UpdateTenantSettingDto } from './services/multiplier-settings.service'; // Yolunu kendine göre ayarla
import Swal from 'sweetalert2';
import { DecimalCommaDirective } from '@/app/core/directive/decimal-comma.directive'; // Directive yolunu kontrol et

@Component({
  selector: 'app-multiplier-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalCommaDirective],
  templateUrl: './multiplier-settings.component.html',
  styles: [`
    /* Inputlardaki ok işaretlerini gizle */
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { 
      -webkit-appearance: none; 
      margin: 0; 
    }
    input[type=number] {
      -moz-appearance: textfield;
    }
  `]
})
export class MultiplierSettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);

  // Gruplanmış Veri Yapısı
  groupedSettings: { category: string, items: any[] }[] = []; // items: any[] yaptık çünkü string/number dönüşümü yapıyoruz
  isLoading = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.settingsService.getMultipliers().subscribe({
      next: (res) => {
        
        // 🔥 KRİTİK DÖNÜŞÜM: Backend (Nokta) -> UI (Virgül)
        // Veritabanından gelen sayıları String'e çevirip noktaları virgül yapıyoruz.
        const formattedData = res.map((item: any) => ({
          ...item,
          buyMultiplier: item.buyMultiplier != null ? item.buyMultiplier.toString().replace('.', ',') : '',
          sellMultiplier: item.sellMultiplier != null ? item.sellMultiplier.toString().replace('.', ',') : '',
          addonAmount: item.addonAmount != null ? item.addonAmount.toString().replace('.', ',') : ''
        }));

        this.groupData(formattedData);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        // Hata mesajı gösterebilirsin
      }
    });
  }

  // Veriyi Kategoriye göre gruplama
  groupData(data: any[]) {
    const groups = data.reduce((acc, item) => {
      const cat = item.categoryName || 'DİĞER';
      if (!acc[cat]) {
        acc[cat] = [];
      }
      acc[cat].push(item);
      return acc;
    }, {} as any);

    this.groupedSettings = Object.keys(groups).map(key => ({
      category: key,
      items: groups[key]
    }));
  }

  saveAll() {
    Swal.fire({
      title: 'Kaydetmek istiyor musunuz?',
      text: "Bu ayarlar anında canlı fiyatlara yansıyacaktır.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Evet, Yayınla',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#198754'
    }).then((result) => {
      if (result.isConfirmed) {
        this.processSave();
      }
    });
  }

  // Yardımcı Fonksiyon: String (Virgüllü) -> Number (Noktalı)
  parseCurrency(val: any): number {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    // Virgülü nokta yap ve sayıya çevir
    return parseFloat(val.toString().replace(',', '.'));
  }

  processSave() {
    this.isLoading = true;

    // UI'daki virgüllü verileri tekrar sayıya çevirip Backend DTO'suna hazırlıyoruz
    const flatList: UpdateTenantSettingDto[] = this.groupedSettings
      .flatMap(group => group.items)
      .map(item => ({
        symbolId: item.symbolId,
        buyMultiplier: this.parseCurrency(item.buyMultiplier),
        sellMultiplier: this.parseCurrency(item.sellMultiplier),
        addonAmount: this.parseCurrency(item.addonAmount)   
      }));

    this.settingsService.updateMultipliers(flatList).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire('Başarılı!', 'Ayarlar güncellendi ve yayına alındı.', 'success');
        
        // Kayıttan sonra veriyi tekrar çekmek iyi bir pratiktir (Veri tutarlılığı için)
        this.loadData();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}