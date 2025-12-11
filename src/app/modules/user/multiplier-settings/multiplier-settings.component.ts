import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, TenantProductDto, UpdateTenantProductDto, CreateTenantProductDto, CategoryDto } from './services/multiplier-settings.service';
import Swal from 'sweetalert2';
import { DecimalCommaDirective } from '@/app/core/directive/decimal-comma.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-multiplier-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalCommaDirective],
  templateUrl: './multiplier-settings.component.html',
  styles: [`
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }
    .table-hover tbody tr:hover { background-color: #f8f9fa; }
    .action-btn { transition: all 0.2s; }
    .action-btn:hover { transform: scale(1.1); }
  `]
})
export class MultiplierSettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private modalService = inject(NgbModal);

  groupedSettings: { category: string, items: any[] }[] = [];
  categories: CategoryDto[] = [];
  isLoading = false;

  // --- MODELLER ---
  newProduct: any = {
    name: '', categoryId: '', sourceKey: 'ALTIN',
    buyMultiplier: '1,0000', sellMultiplier: '1,0000', addonAmount: '0,00'
  };

  // Düzenlenecek ürün için geçici model
  editingProduct: any = {};

  @ViewChild('addProductModal') addProductModal!: ElementRef;
  @ViewChild('editProductModal') editProductModal!: ElementRef;

  ngOnInit() {
    this.loadData();
    this.loadCategories();
  }

  loadData() {
    this.isLoading = true;
    this.settingsService.getProducts().subscribe({
      next: (res) => {
        const formattedData = res.map((item) => ({
          ...item,
          // String formatına çevir (UI için)
          buyMultiplier: this.formatNumber(item.buyMultiplier),
          sellMultiplier: this.formatNumber(item.sellMultiplier),
          addonAmount: this.formatNumber(item.addonAmount)
        }));
        this.groupData(formattedData);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  loadCategories() {
    this.settingsService.getCategories().subscribe(res => {
      this.categories = res;
      if (res.length > 0) this.newProduct.categoryId = res[0].id;
    });
  }

  groupData(data: any[]) {
    const groups = data.reduce((acc, item) => {
      const cat = item.categoryName || 'DİĞER';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as any);

    this.groupedSettings = Object.keys(groups).map(key => ({
      category: key,
      items: groups[key]
    }));
  }

  // --- EDIT MODAL ---

  openEditModal(item: any) {
    // Referansı koparmak için kopyasını alıyoruz (UI anlık bozulmasın diye)
    this.editingProduct = { ...item };
    
    // Kategori ID'sini bulmak gerekebilir (Backend dönüyorsa direkt ata)
    // Eğer backend categoryId dönmüyorsa categoryName'den bulmaya çalışabiliriz
    if (!this.editingProduct.categoryId) {
        const cat = this.categories.find(c => c.name === item.categoryName);
        if (cat) this.editingProduct.categoryId = cat.id;
    }

    this.modalService.open(this.editProductModal, { centered: true });
  }

  saveEditedProduct() {
    this.isLoading = true;
    
    // Tekil güncellemeyi backend'e liste içinde gönderiyoruz (Endpoint list bekliyor)
    const updateDto: UpdateTenantProductDto = {
        id: this.editingProduct.id,
        name: this.editingProduct.name,
        categoryId: this.editingProduct.categoryId, // Kategori değişimi
        sourceKey: this.editingProduct.sourceKey,   // Kaynak değişimi
        buyMultiplier: this.parseCurrency(this.editingProduct.buyMultiplier),
        sellMultiplier: this.parseCurrency(this.editingProduct.sellMultiplier),
        addonAmount: this.parseCurrency(this.editingProduct.addonAmount),
        isActive: this.editingProduct.isActive
    };

    this.settingsService.updateProducts([updateDto]).subscribe({
        next: () => {
            this.modalService.dismissAll();
            this.isLoading = false;
            Swal.fire('Güncellendi', 'Ürün başarıyla güncellendi.', 'success');
            this.loadData(); // Listeyi yenile
        },
        error: () => this.isLoading = false
    });
  }

  // --- SAVE ALL ---

  saveAll() {
    Swal.fire({
      title: 'Kaydetmek istiyor musunuz?',
      text: "Değişiklikler canlı fiyatlara yansıyacaktır.",
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Evet, Yayınla',
      confirmButtonColor: '#198754'
    }).then((result) => {
      if (result.isConfirmed) this.processSaveAll();
    });
  }

  processSaveAll() {
    this.isLoading = true;
    const flatList: UpdateTenantProductDto[] = this.groupedSettings
      .flatMap(group => group.items)
      .map(item => ({
        id: item.id,
        name: item.name,
        categoryId: item.categoryId,
        // Toplu kayıtta kategori/sourceKey değişimi genelde yapılmaz ama eklenebilir
        buyMultiplier: this.parseCurrency(item.buyMultiplier),
        sellMultiplier: this.parseCurrency(item.sellMultiplier),
        addonAmount: this.parseCurrency(item.addonAmount),
        isActive: item.isActive
      }));

    this.settingsService.updateProducts(flatList).subscribe({
      next: () => {
        this.isLoading = false;
        Swal.fire('Başarılı!', 'Tüm ayarlar güncellendi.', 'success');
        this.loadData();
      },
      error: () => this.isLoading = false
    });
  }

  // --- CREATE & DELETE ---

  openModal(content: any) {
    this.modalService.open(content, { centered: true });
  }

  createProduct() {
    const payload: CreateTenantProductDto = {
      name: this.newProduct.name,
      categoryId: this.newProduct.categoryId,
      sourceKey: this.newProduct.sourceKey,
      buyMultiplier: this.parseCurrency(this.newProduct.buyMultiplier),
      sellMultiplier: this.parseCurrency(this.newProduct.sellMultiplier),
      addonAmount: this.parseCurrency(this.newProduct.addonAmount),
      orderIndex: 99
    };

    this.settingsService.createProduct(payload).subscribe(() => {
      this.modalService.dismissAll();
      Swal.fire('Başarılı', 'Ürün oluşturuldu.', 'success');
      this.loadData();
      this.resetNewProductForm();
    });
  }

  deleteProduct(id: string) {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu ürün kalıcı olarak silinecektir!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      confirmButtonText: 'Evet, Sil'
    }).then((result) => {
      if (result.isConfirmed) {
        this.settingsService.deleteProduct(id).subscribe(() => {
          Swal.fire('Silindi!', 'Ürün silindi.', 'success');
          this.loadData();
        });
      }
    });
  }

  resetNewProductForm() {
    this.newProduct = {
      name: '',
      categoryId: this.categories.length > 0 ? this.categories[0].id : '',
      sourceKey: 'ALTIN',
      buyMultiplier: '1,0000',
      sellMultiplier: '1,0000',
      addonAmount: '0,00'
    };
  }

  // --- UTILS ---
  formatNumber(val: number): string {
    return val != null ? val.toString().replace('.', ',') : '';
  }

  parseCurrency(val: any): number {
    if (!val) return 0;
    if (typeof val === 'number') return val;
    return parseFloat(val.toString().replace(',', '.'));
  }
}