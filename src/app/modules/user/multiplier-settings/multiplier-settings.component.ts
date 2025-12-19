import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingsService, TenantProductDto, UpdateTenantProductDto, CreateTenantProductDto, CategoryDto, UpdateProductOrderDto } from './services/multiplier-settings.service';
import Swal from 'sweetalert2';
import { DecimalCommaDirective } from '@/app/core/directive/decimal-comma.directive';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

// CDK Importları (Sürükle Bırak İçin)
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-multiplier-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalCommaDirective, DragDropModule],
  templateUrl: './multiplier-settings.component.html',
  styles: [`
    input[type=number]::-webkit-inner-spin-button, 
    input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; }
    input[type=number] { -moz-appearance: textfield; }
    .table-hover tbody tr:hover { background-color: #f8f9fa; }
    .action-btn { transition: all 0.2s; }
    .action-btn:hover { transform: scale(1.1); }
    .cursor-grab { cursor: grab; }
    .cursor-grab:active { cursor: grabbing; }

    /* CDK Drag Styles */
    .cdk-drag-preview {
        box-sizing: border-box;
        border-radius: 4px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.15);
        background: #fff;
        display: table;
        width: 100%;
    }
    .cdk-drag-preview td {
        padding: 8px;
        vertical-align: middle;
        border-bottom: 1px solid #ddd;
    }
    .cdk-drag-placeholder {
        opacity: 0;
    }
    .cdk-drag-animating {
        transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
    }
    .draggable-row:active {
        background-color: #f8f9fa;
    }
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
          // Formatlanmış string değerler
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
      // KRİTİK NOKTA: Backend'den geleni orderIndex'e göre kesinlikle sıralıyoruz.
      items: groups[key].sort((a: any, b: any) => (a.orderIndex || 9999) - (b.orderIndex || 9999))
    }));
  }

  // --- DRAG & DROP FONKSİYONU ---
  onDrop(event: CdkDragDrop<any[]>, groupItems: any[]) {
    // 1. UI'da yerini değiştir
    moveItemInArray(groupItems, event.previousIndex, event.currentIndex);

    // 2. Yeni sıraları oluştur (1'den başlayarak)
    const reorderedList: UpdateProductOrderDto[] = groupItems.map((item, index) => ({
        productId: item.id,
        newIndex: index + 1
    }));

    // 3. Backend'e gönder (Sessizce kaydet)
    this.settingsService.updateProductOrder(reorderedList).subscribe({
        next: () => console.log('Sıralama güncellendi'),
        error: () => Swal.fire('Hata', 'Sıralama kaydedilemedi.', 'error')
    });
  }

  // --- EDIT MODAL ---
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
            this.loadData();
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