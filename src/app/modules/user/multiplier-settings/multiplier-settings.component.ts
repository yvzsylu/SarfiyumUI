import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, TenantProductDto, UpdateTenantProductDto, CreateTenantProductDto, CategoryDto, UpdateProductOrderDto, SystemCatalogDto } from './services/multiplier-settings.service';
import Swal from 'sweetalert2';
import { DecimalCommaDirective } from '@/app/core/directive/decimal-comma.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-multiplier-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalCommaDirective, DragDropModule],
  templateUrl: './multiplier-settings.component.html',
  styles: [`
    .select2-list-container { max-height: 400px; overflow-y: auto; border: 1px solid #e9ebec; border-top: none; }
    .select2-item { cursor: pointer; transition: background-color 0.2s; }
    .select2-item:hover { background-color: #f3f6f9; }
    input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }
    .cursor-grab { cursor: grab; } .cursor-grab:active { cursor: grabbing; }
    .cdk-drag-preview { box-sizing: border-box; border-radius: 4px; box-shadow: 0 5px 15px rgba(0,0,0,0.15); background: #fff; display: table; width: 100%; }
    .cdk-drag-preview td { padding: 8px; vertical-align: middle; border-bottom: 1px solid rgba(0,0,0,0.1); }
    .cdk-drag-placeholder { opacity: 0; }
    .cdk-drag-animating { transition: transform 250ms cubic-bezier(0, 0, 0.2, 1); }
    .draggable-row:active { background-color: rgba(var(--vz-primary-rgb), 0.05); }
    .table-hover tbody tr:hover { background-color: rgba(var(--vz-primary-rgb), 0.05); }
  `]
})
export class MultiplierSettingsComponent implements OnInit {
  private settingsService = inject(SettingsService);
  private modalService = inject(NgbModal);

  groupedSettings: { category: string, items: any[] }[] = [];
  categories: CategoryDto[] = [];
  isLoading = false;

  // 🔥 Modelleri Güncelledik (Varsayılan olarak Web ve Mobil açık)
  newProduct: any = { 
      name: '', categoryId: '', sourceKey: 'ALTIN', 
      buyMultiplier: '1,0000', sellMultiplier: '1,0000', addonAmount: '0,00',
      showOnWeb: true, showOnMobile: true 
  };
  editingProduct: any = {};

  allCatalogItems: SystemCatalogDto[] = [];      
  filteredCatalogItems: SystemCatalogDto[] = []; 
  catalogSearchText: string = '';
  selectedCatalogCategory: string = '';
  isLoadingCatalog = false;

  @ViewChild('addProductModal') addProductModal!: ElementRef;
  @ViewChild('editProductModal') editProductModal!: ElementRef;
  @ViewChild('catalogModal') catalogModal!: ElementRef;

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
      items: groups[key].sort((a: any, b: any) => (a.orderIndex || 9999) - (b.orderIndex || 9999))
    }));
  }

  // 🔥 YENİ METOD: Platform Toggle (Web ve Mobil için ayrı metodları çağırır)
  togglePlatform(item: TenantProductDto, platform: 'web' | 'mobile') {
    if (platform === 'web') {
        item.showOnWeb = !item.showOnWeb; // UI'da anlık değiştir
        this.settingsService.toggleWeb(item.id).subscribe({
            error: () => item.showOnWeb = !item.showOnWeb // Hata olursa geri al
        });
    } else {
        item.showOnMobile = !item.showOnMobile; // UI'da anlık değiştir
        this.settingsService.toggleMobile(item.id).subscribe({
            error: () => item.showOnMobile = !item.showOnMobile // Hata olursa geri al
        });
    }
  }

  openCatalogModal(content: any) {
    if (this.categories.length > 0 && !this.selectedCatalogCategory) {
       this.selectedCatalogCategory = this.categories[0].id;
    }
    this.catalogSearchText = '';
    this.modalService.open(content, { size: 'lg', centered: true, scrollable: true });
    this.loadCatalogData();
  }

  loadCatalogData() {
    this.isLoadingCatalog = true;
    this.settingsService.getSystemCatalog().subscribe({
      next: (res) => {
        this.allCatalogItems = res;       
        this.filteredCatalogItems = res;  
        this.isLoadingCatalog = false;
      },
      error: () => this.isLoadingCatalog = false
    });
  }

  filterCatalog(event: any) {
    const val = event.target.value.toLocaleLowerCase('tr');
    this.catalogSearchText = val;
    if (!val) {
      this.filteredCatalogItems = this.allCatalogItems;
    } else {
      this.filteredCatalogItems = this.allCatalogItems.filter(item => 
          item.name.toLocaleLowerCase('tr').includes(val) || 
          item.sourceKey.toLocaleLowerCase('tr').includes(val)
      );
    }
  }

  addCatalogItem(item: SystemCatalogDto) {
    if (!this.selectedCatalogCategory) {
        Swal.fire('Uyarı', 'Lütfen listeden bir kategori seçiniz.', 'warning');
        return;
    }
    const payload: CreateTenantProductDto = {
        name: item.name,
        sourceKey: item.sourceKey,
        categoryId: this.selectedCatalogCategory,
        buyMultiplier: 1.0, 
        sellMultiplier: 1.0, 
        addonAmount: 0, 
        orderIndex: 999,
        // Varsayılan olarak her yerde göster
        showOnWeb: true,
        showOnMobile: true
    };
    this.settingsService.createProduct(payload).subscribe({
        next: () => {
            this.modalService.dismissAll(); 
            this.loadData(); 
        },
        error: (err) => {
            Swal.fire('Hata', err.error?.message || 'Ürün eklenemedi.', 'error');
        }
    });
  }

  isCreditCard(categoryId: string): boolean {
    const cat = this.categories.find(c => c.id === categoryId);
    return cat?.name === 'Kredi Kartı';
  }

  onCategoryChange(event: any) {
    if (this.isCreditCard(this.newProduct.categoryId)) {
      this.newProduct.buyMultiplier = '0,00';
    } else {
      this.newProduct.buyMultiplier = '1,0000';
    }
  }

  onDrop(event: CdkDragDrop<any[]>, groupItems: any[]) {
    moveItemInArray(groupItems, event.previousIndex, event.currentIndex);
    const reorderedList: UpdateProductOrderDto[] = groupItems.map((item, index) => ({
        productId: item.id, newIndex: index + 1
    }));
    this.settingsService.updateProductOrder(reorderedList).subscribe({
        next: () => console.log('Sıralama güncellendi'),
        error: () => Swal.fire('Hata', 'Sıralama kaydedilemedi.', 'error')
    });
  }

  openEditModal(item: any) {
    this.editingProduct = { ...item };
    if (!this.editingProduct.categoryId) {
        const cat = this.categories.find(c => c.name === item.categoryName);
        if (cat) this.editingProduct.categoryId = cat.id;
    }
    this.modalService.open(this.editProductModal, { centered: true });
  }

  saveEditedProduct() {
    this.isLoading = true;
    const updateDto: UpdateTenantProductDto = {
        id: this.editingProduct.id,
        name: this.editingProduct.name,
        categoryId: this.editingProduct.categoryId,
        sourceKey: this.editingProduct.sourceKey,
        buyMultiplier: this.isCreditCard(this.editingProduct.categoryId) ? 0 : this.parseCurrency(this.editingProduct.buyMultiplier),
        sellMultiplier: this.parseCurrency(this.editingProduct.sellMultiplier),
        addonAmount: this.parseCurrency(this.editingProduct.addonAmount),
        isActive: this.editingProduct.isActive,
        // 🔥 GÜNCELLEME: Platform ayarlarını da gönder
        showOnWeb: this.editingProduct.showOnWeb,
        showOnMobile: this.editingProduct.showOnMobile
    };
    this.settingsService.updateProducts([updateDto]).subscribe({
        next: () => {
            this.modalService.dismissAll();
            this.isLoading = false;
            Swal.fire('Güncellendi', 'Ürün başarıyla güncellendi.', 'success');
            this.loadData();
        },
        error: () => this.isLoading = false
    });
  }

  saveAll() {
    Swal.fire({
      title: 'Kaydetmek istiyor musunuz?', text: "Değişiklikler canlı fiyatlara yansıyacaktır.", icon: 'question',
      showCancelButton: true, confirmButtonText: 'Evet, Yayınla', confirmButtonColor: '#198754'
    }).then((result) => { if (result.isConfirmed) this.processSaveAll(); });
  }

  processSaveAll() {
    this.isLoading = true;
    const flatList: UpdateTenantProductDto[] = this.groupedSettings
      .flatMap(group => group.items)
      .map(item => ({
        id: item.id, name: item.name, categoryId: item.categoryId,
        buyMultiplier: item.categoryName === 'Kredi Kartı' ? 0 : this.parseCurrency(item.buyMultiplier),
        sellMultiplier: this.parseCurrency(item.sellMultiplier), addonAmount: this.parseCurrency(item.addonAmount), isActive: item.isActive,
        // 🔥 KAYDET: Tüm listeyi kaydederken de bu alanları gönderiyoruz
        showOnWeb: item.showOnWeb,
        showOnMobile: item.showOnMobile
      }));
    this.settingsService.updateProducts(flatList).subscribe({
      next: () => { this.isLoading = false; Swal.fire('Başarılı!', 'Tüm ayarlar güncellendi.', 'success'); this.loadData(); },
      error: () => this.isLoading = false
    });
  }

  openModal(content: any) { this.modalService.open(content, { centered: true }); }

  createProduct() {
    const payload: CreateTenantProductDto = {
      name: this.newProduct.name, categoryId: this.newProduct.categoryId, sourceKey: this.newProduct.sourceKey,
      buyMultiplier: this.isCreditCard(this.newProduct.categoryId) ? 0 : this.parseCurrency(this.newProduct.buyMultiplier),
      sellMultiplier: this.parseCurrency(this.newProduct.sellMultiplier), addonAmount: this.parseCurrency(this.newProduct.addonAmount), orderIndex: 99,
      // 🔥 YENİ ÜRÜN İÇİN VARSAYILAN DEĞERLER
      showOnWeb: this.newProduct.showOnWeb ?? true,
      showOnMobile: this.newProduct.showOnMobile ?? true
    };
    this.settingsService.createProduct(payload).subscribe(() => {
      this.modalService.dismissAll(); Swal.fire('Başarılı', 'Ürün oluşturuldu.', 'success'); this.loadData(); this.resetNewProductForm();
    });
  }

  deleteProduct(id: string) {
    Swal.fire({ title: 'Emin misiniz?', text: "Bu ürün kalıcı olarak silinecektir!", icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', confirmButtonText: 'Evet, Sil' }).then((result) => {
      if (result.isConfirmed) { this.settingsService.deleteProduct(id).subscribe(() => { Swal.fire('Silindi!', 'Ürün silindi.', 'success'); this.loadData(); }); }
    });
  }

  resetNewProductForm() {
    this.newProduct = { 
        name: '', categoryId: this.categories.length > 0 ? this.categories[0].id : '', 
        sourceKey: 'ALTIN', buyMultiplier: '1,0000', sellMultiplier: '1,0000', addonAmount: '0,00',
        showOnWeb: true, showOnMobile: true 
    };
  }

  formatNumber(val: number): string { return val != null ? val.toString().replace('.', ',') : '0,00'; }
  parseCurrency(val: any): number { if (!val) return 0; if (typeof val === 'number') return val; const cleanVal = val.toString().replace(',', '.'); return parseFloat(cleanVal) || 0; }
}