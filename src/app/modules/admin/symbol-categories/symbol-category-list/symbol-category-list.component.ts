import { Component, OnInit, inject,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SymbolCategoryService, SymbolCategoryDto } from '../services/symbol-category.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-symbol-category-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './symbol-category-list.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]

})
export class SymbolCategoryListComponent implements OnInit {
  private categoryService = inject(SymbolCategoryService);

  categories: SymbolCategoryDto[] = [];
  isLoading = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.categoryService.getAll().subscribe({
      next: (res) => {
        this.categories = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  deleteCategory(id: string) {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu kategoriyi silmek istediğinize emin misiniz? (Bağlı sembol varsa silinmez)",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.categoryService.delete(id).subscribe({
          next: () => {
            Swal.fire('Silindi!', 'Kategori başarıyla silindi.', 'success');
            this.loadData();
          }
        });
      }
    });
  }
}