import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { SubscriptionService, PaymentHistoryDto, AdjustDaysRequest } from '../services/subscription.service';
import { CustomerService, CustomerDto } from '../../customer/services/customer.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subscription-list',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './subscription-list.component.html',
})
export class SubscriptionListComponent implements OnInit {
  private subService = inject(SubscriptionService);
  private customerService = inject(CustomerService);
  private route = inject(ActivatedRoute);

  tenantSelectControl = new FormControl('');
  tenantList: CustomerDto[] = [];
  historyList: PaymentHistoryDto[] = [];
  
  isLoading = false;
  selectedTenantId: string | null = null;

  ngOnInit() {
    // 1. Firmaları getir (Filtre için)
    this.loadTenants();

    // 2. Eğer URL'den tenantId gelirse otomatik seç ve yükle
    const paramId = this.route.snapshot.paramMap.get('tenantId');
    if (paramId) {
        this.selectedTenantId = paramId;
        this.tenantSelectControl.setValue(paramId);
        this.loadHistory(paramId);
    }
  }

  // 🔥 YENİ METOD: Gün Düzenle Modalı
  openAdjustDaysModal(subscriptionId: string) {
    
    Swal.fire({
      title: 'Manuel Süre Ayarı',
      html: `
        <p>Seçili kayıt için gün eklemek (+5) veya çıkarmak (-2) için değer giriniz.</p>
      `,
      input: 'number',
      inputAttributes: {
        placeholder: 'Örn: 5'
      },
      showCancelButton: true,
      confirmButtonText: 'Uygula',
      cancelButtonText: 'İptal',
      showLoaderOnConfirm: true,
      preConfirm: (days) => {
        if (!days) Swal.showValidationMessage(`Gün sayısı giriniz`);
        
        // Backend'e ID ve Gün sayısını gönderiyoruz
        const request: AdjustDaysRequest = {
            id: subscriptionId, // 🔥 Satırdan gelen ID
            days: Number(days)
        };

        return this.subService.adjustDays(request).toPromise()
          .then(response => {
             return response;
          })
          .catch(error => {
            const msg = error.error?.messages?.[0] || 'İşlem başarısız';
            Swal.showValidationMessage(`Hata: ${msg}`);
          });
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Başarılı!',
          text: 'Kayıt güncellendi.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });
        
        // Listeyi yenile (Mevcut seçili firma hangisiyse onun listesini yeniler)
        if(this.selectedTenantId) {
            this.loadHistory(this.selectedTenantId);
        }
      }
    });
  }

  deleteSubscription(id: string) {
    Swal.fire({
      title: 'Emin misiniz?',
      text: "Bu kayıt silinecek ve firmanın abonelik süresi geri alınacak!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Evet, Sil!',
      cancelButtonText: 'İptal'
    }).then((result) => {
      if (result.isConfirmed) {
        this.subService.deleteSubscription(id).subscribe({
          next: () => {
            Swal.fire('Silindi!', 'Kayıt silindi ve süre güncellendi.', 'success');
            // Listeyi yenile (Mevcut seçili tenantId ile)
            if (this.selectedTenantId) {
                this.loadHistory(this.selectedTenantId);
            }
          }
        });
      }
    });
  }

  loadTenants() {
    this.customerService.getAll().subscribe({
        next: (res) => {
            this.tenantList = res;
        }
    });
  }

  onTenantChange() {
    const tenantId = this.tenantSelectControl.value;
    if (tenantId) {
        this.selectedTenantId = tenantId;
        this.loadHistory(tenantId);
    } else {
        this.selectedTenantId = null;
        this.historyList = [];
    }
  }

  loadHistory(tenantId: string) {
    this.isLoading = true;
    this.subService.getHistory(tenantId).subscribe({
      next: (res) => {
        this.historyList = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}