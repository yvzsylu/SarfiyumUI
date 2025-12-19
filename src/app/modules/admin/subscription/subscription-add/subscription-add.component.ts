import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { SubscriptionService, AddSubscriptionRequest } from '../services/subscription.service';
import { CustomerService, CustomerDto } from '../../customer/services/customer.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subscription-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './subscription-add.component.html',
})
export class SubscriptionAddComponent implements OnInit {
  private fb = inject(FormBuilder);
  private subService = inject(SubscriptionService);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  addForm: FormGroup;
  submitted = false;
  isLoading = false;

  tenantList: CustomerDto[] = []; 

  constructor() {
    this.addForm = this.fb.group({
      tenantId: ['', Validators.required],
      planType: [1, Validators.required], // Default: Aylık (1)
      amount: [0, [Validators.required, Validators.min(0)]],
      isPaid: [true], // Default: Ödendi
      note: ['']
    });
  }

  ngOnInit() {
    // 1. Firmaları Getir
    this.loadTenants();

    // 2. URL'den parametre geliyorsa formu doldur
    const paramTenantId = this.route.snapshot.paramMap.get('tenantId');
    if(paramTenantId) {
      this.addForm.patchValue({ tenantId: paramTenantId });
    }
  }

  loadTenants() {
    this.customerService.getAll().subscribe({
      next: (res) => {
        this.tenantList = res;
      }
    });
  }

  get f() { return this.addForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.addForm.invalid) return;

    this.isLoading = true;

    // Form verisini hazırla
    const formVal = this.addForm.value;
    const request: AddSubscriptionRequest = {
        tenantId: formVal.tenantId,
        planType: Number(formVal.planType),
        amount: formVal.amount,
        isPaid: formVal.isPaid,
        note: formVal.note
    };

    // Backend'e gönder (Kontrol tamamen Backend'de)
    this.subService.addSubscription(request).subscribe({
      next: (res) => {
        // Başarılı
        Swal.fire({
          icon: 'success',
          title: 'Başarılı',
          text: 'Abonelik başarıyla oluşturuldu.',
          timer: 1500,
          showConfirmButton: false
        }).then(() => {
          this.router.navigate(['/admin/subscriptions/list']);
        });
      },
      error: (err) => {
        // Backend'den "Aktif abonelik var" hatası gelirse burada yakalanır
        this.isLoading = false;
        
        // Backend'den gelen hata mesajını göster
        const msg = err.error?.messages?.[0] || 'İşlem sırasında bir hata oluştu.';
        Swal.fire({
          icon: 'error',
          title: 'İşlem Başarısız',
          text: msg
        });
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}