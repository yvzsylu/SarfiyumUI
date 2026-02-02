import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { VisitorProductSettingDto, VisitorProductSettingResponse } from '@/app/modules/admin/users/services/user.service'; // Yolu projene göre ayarla
import { ViewerService, } from '../../services/viewer.service'; // Yolu projene göre ayarla
import { forkJoin } from 'rxjs';
import Swal from 'sweetalert2';
import { DecimalCommaDirective } from '@/app/core/directive/decimal-comma.directive'; // Directive varsa ekle
import { SettingsService, TenantProductDto } from '../../../multiplier-settings/services/multiplier-settings.service';

interface MergedProductItem extends TenantProductDto {
  // Override Değerleri (Frontend'de editleyeceğimiz alanlar)
  specialBuyMultiplier?: number | null;
  specialSellMultiplier?: number | null;
  specialAddonAmount?: number | null;
  
  // UI Kontrolü: Bu üründe özel ayar var mı?
  hasSpecialSetting: boolean;
  isModified: boolean; // Değişiklik yapıldı mı?
}

@Component({
  selector: 'app-visitor-pricing-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalCommaDirective],
  templateUrl: './visitor-pricing-modal.component.html',
  styles: [`
    .table-fixed-header { max-height: 60vh; overflow-y: auto; }
    .bg-special { background-color: #fff8e1 !important; } /* Özel ayar varsa sarımtırak yap */
  `]
})
export class VisitorPricingModalComponent implements OnInit {
  activeModal = inject(NgbActiveModal);
  private settingsService = inject(SettingsService); // Genel ürünleri çekmek için
  private viewerService = inject(ViewerService);     // Özel ayarları çekmek için

  @Input() visitorId!: string;
  @Input() visitorName!: string;

  isLoading = false;
  products: MergedProductItem[] = [];
  groupedProducts: { category: string, items: MergedProductItem[] }[] = [];

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    // 🔥 Kritik Nokta: Hem genel ürünleri hem de bu kullanıcının özel ayarlarını aynı anda çekiyoruz.
    forkJoin({
      allProducts: this.settingsService.getProducts(),
      visitorSettings: this.viewerService.getVisitorSettings(this.visitorId)
    }).subscribe({
      next: (res) => {
        this.mergeData(res.allProducts, res.visitorSettings);
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Hata', 'Veriler yüklenemedi.', 'error');
        this.activeModal.dismiss();
      }
    });
  }

  mergeData(allProducts: TenantProductDto[], settings: VisitorProductSettingResponse[]) {
    // Ürünleri dolaş ve ayarları eşleştir
    this.products = allProducts.map(prod => {
      const setting = settings.find(s => s.tenantProductId === prod.id);
      
      return {
        ...prod,
        // Eğer ayar varsa veritabanından gelen değeri, yoksa null ata
        specialBuyMultiplier: setting ? setting.specialBuyMultiplier : null,
        specialSellMultiplier: setting ? setting.specialSellMultiplier : null,
        specialAddonAmount: setting ? setting.specialAddonAmount : null,
        hasSpecialSetting: !!setting,
        isModified: false
      };
    });

    this.groupData();
  }

  groupData() {
    const groups = this.products.reduce((acc, item) => {
      const cat = item.categoryName || 'DİĞER';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as any);

    this.groupedProducts = Object.keys(groups).map(key => ({
      category: key,
      items: groups[key].sort((a: any, b: any) => (a.orderIndex || 999) - (b.orderIndex || 999))
    }));
  }

  // Input değiştiğinde tetiklenir
  onValueChange(item: MergedProductItem) {
    item.isModified = true;
    
    // Eğer kullanıcı kutuları temizlerse null yapalım ki "Varsayılan" olsun
    if (item.specialBuyMultiplier === undefined || item.specialBuyMultiplier?.toString() === '') item.specialBuyMultiplier = null;
    if (item.specialSellMultiplier === undefined || item.specialSellMultiplier?.toString() === '') item.specialSellMultiplier = null;
    if (item.specialAddonAmount === undefined || item.specialAddonAmount?.toString() === '') item.specialAddonAmount = null;

    // Eğer tüm alanlar boşsa veya null ise, "Özel Ayar" statüsünden çıkarılabilir (Kaydederken bakacağız)
    const hasValue = (item.specialBuyMultiplier != null) || (item.specialSellMultiplier != null) || (item.specialAddonAmount != null);
    item.hasSpecialSetting = hasValue;
  }

  // Varsayılana Sıfırla Butonu İçin
  resetToDefault(item: MergedProductItem) {
    Swal.fire({
      title: 'Varsayılana Dön?',
      text: `${item.name} için özel fiyat kaldırılacak ve mağaza geneli fiyatlar geçerli olacak.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Sıfırla'
    }).then((res) => {
      if (res.isConfirmed) {
        this.viewerService.deleteVisitorSetting(this.visitorId, item.id).subscribe(() => {
          // UI Güncelle
          item.specialBuyMultiplier = null;
          item.specialSellMultiplier = null;
          item.specialAddonAmount = null;
          item.hasSpecialSetting = false;
          item.isModified = false;
          // Swal.fire('Başarılı', 'Özel fiyat kaldırıldı.', 'success'); // Çok sık çıkmasın diye kapattım
        });
      }
    });
  }

  saveAll() {
    // Sadece değişenleri veya özel ayarı olanları bul
    const itemsToSave = this.products.filter(p => p.isModified && p.hasSpecialSetting);

    if (itemsToSave.length === 0) {
      Swal.fire('Bilgi', 'Kaydedilecek bir değişiklik yok.', 'info');
      return;
    }

    this.isLoading = true;

    // Backendimiz tek tek kayıt alıyor (Upsert). 
    // Hepsini paralel göndermek için forkJoin kullanıyoruz (Best Practice: Backend bulk update desteklese daha iyi olurdu ama bu da çalışır)
    const requests = itemsToSave.map(item => {
      const dto: VisitorProductSettingDto = {
        visitorId: this.visitorId,
        tenantProductId: item.id,
        specialBuyMultiplier: this.parseCurrency(item.specialBuyMultiplier),
        specialSellMultiplier: this.parseCurrency(item.specialSellMultiplier),
        specialAddonAmount: this.parseCurrency(item.specialAddonAmount)
      };
      return this.viewerService.upsertVisitorSetting(dto);
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire('Başarılı', 'Özel fiyatlar güncellendi.', 'success');
        this.activeModal.close('saved');
      },
      error: () => {
        this.isLoading = false;
        Swal.fire('Hata', 'Bazı kayıtlar güncellenemedi.', 'error');
      }
    });
  }

  // Helper
  parseCurrency(val: any): number | null {
    if (val === null || val === undefined || val === '') return null;
    if (typeof val === 'number') return val;
    const cleanVal = val.toString().replace(',', '.');
    return parseFloat(cleanVal) || 0;
  }
}