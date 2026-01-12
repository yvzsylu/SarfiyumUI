import { Component, CUSTOM_ELEMENTS_SCHEMA, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // ngModel için şart
import { RouterModule } from '@angular/router';
import Swal from 'sweetalert2'; // Toast notification için kullanabiliriz veya Toastr

// Servisler ve Modeller
import { CategoryService } from '../services/category.service';
import { TenantCategory } from '@/app/core/models/tenant-category.model';

@Component({
  selector: 'app-category-settings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule], // FormsModule Eklendi
  templateUrl: './category-settings.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CategorySettingsComponent implements OnInit {
  private categoryService = inject(CategoryService);
  
  categories: TenantCategory[] = [];
  isLoading = false;

  // Inline Edit Yönetimi
  editingId: string | null = null;
  editNameValue: string = '';

  ngOnInit() {
    this.loadCategories();
  }

  loadCategories() {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        // Backend zaten orderIndex'e göre sıralı gönderiyor
        this.categories = data;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  // Düzenleme modunu açar
  startEdit(item: TenantCategory) {
    this.editingId = item.id;
    this.editNameValue = item.name;
  }

  // Düzenlemeyi iptal eder
  cancelEdit() {
    this.editingId = null;
    this.editNameValue = '';
  }

  // Kaydetme işlemi
  saveEdit(item: TenantCategory) {
    if (!this.editNameValue.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Uyarı',
        text: 'Kategori adı boş olamaz!',
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
      });
      return;
    }

    this.isLoading = true;
    this.categoryService.updateCategoryName(item.id, this.editNameValue).subscribe({
      next: (res) => {
        // Başarılı olursa listedeki veriyi güncelle
        item.name = this.editNameValue;
        
        Swal.fire({
          icon: 'success',
          title: 'Başarılı',
          text: 'Kategori adı güncellendi.',
          toast: true,
          position: 'top-end',
          showConfirmButton: false,
          timer: 3000
        });

        this.cancelEdit();
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        // Hata BaseApiService içinde handle ediliyorsa burası boş kalabilir
      }
    });
  }
}