import { Component, OnInit, inject, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbPaginationModule, NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomerStateComponent } from './components/customer-state/customer-state.component'; // Varsa
import { CustomerService, CustomerDto } from '../services/customer.service'; // Servis yolun
import Swal from 'sweetalert2';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    NgbPaginationModule, 
    NgbDropdownModule,
    CustomerStateComponent
  ],
  templateUrl: './customer-list.component.html',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CustomerListComponent implements OnInit {
  private service = inject(CustomerService);

  customerList: CustomerDto[] = [];
  isLoading = false;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.service.getAll().subscribe({
      next: (res) => {
        this.customerList = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  // STATUS DEĞİŞTİRME
  onStatusChange(customer: CustomerDto, event: any) {
    const newStatus = event.target.checked; // true veya false
    
    // Servise gönder
    this.service.updateStatus(customer.id!, newStatus).subscribe({
      next: () => {
        // Başarılıysa modeldeki veriyi de güncelle (UI tutarlılığı için)
        customer.isActive = newStatus;
        // BaseService zaten success toastr gösteriyor, ekstra bir şey yapmana gerek yok.
      },
      error: () => {
        // Hata olursa switch'i eski haline geri getir (Rollback UI)
        event.target.checked = !newStatus;
      }
    });
  }

  deleteCustomer(id: string) {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu müşteri silinecek!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, Sil!'
    }).then((result) => {
      if (result.isConfirmed) {
        this.service.delete(id).subscribe({
          next: () => {
            Swal.fire('Silindi!', 'Kayıt silindi.', 'success');
            this.loadData();
          }
        });
      }
    });
  }
}