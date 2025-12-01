import { Component, OnInit, inject,CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SymbolService, SymbolListDto } from '../services/symbol.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-symbol-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './symbol-list.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]


})
export class SymbolListComponent implements OnInit {
  private symbolService = inject(SymbolService);

  symbols: SymbolListDto[] = [];
  isLoading = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.symbolService.getAllSymbols().subscribe({
      next: (res) => {
        this.symbols = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onStatusChange(item: SymbolListDto, event: any) {
    // Backend toggle metodunu çağır
    this.symbolService.toggleStatus(item.id).subscribe({
      next: () => {
        item.isActive = event.target.checked;
      },
      error: () => {
        event.target.checked = !event.target.checked; // Geri al
      }
    });
  }

  deleteSymbol(id: string) {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu sembolü silmek istediğinize emin misiniz?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        this.symbolService.delete(id).subscribe(() => {
          Swal.fire('Silindi!', 'Sembol silindi.', 'success');
          this.loadData();
        });
      }
    });
  }
}