import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { SubscriptionService, UpdateSubscriptionRequest } from '../services/subscription.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-subscription-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './subscription-edit.component.html',
})
export class SubscriptionEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private subService = inject(SubscriptionService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editForm: FormGroup;
  submitted = false;
  isLoading = false;
  subscriptionId: string | null = null;
  
  constructor() {
    this.editForm = this.fb.group({
      status: [1, Validators.required], // YENİ: Status alanı
      planType: [1, Validators.required],
      amount: [0, [Validators.required, Validators.min(0)]],
      isPaid: [true],
      note: ['']
    });
  }

  ngOnInit() {
    this.subscriptionId = this.route.snapshot.paramMap.get('id');
    if (this.subscriptionId) {
      this.loadData(this.subscriptionId);
    }
  }

  loadData(id: string) {
    this.isLoading = true;
    this.subService.getById(id).subscribe({
      next: (res) => {
        // PlanName "Aylık" veya "Yıllık" string geliyor, bunu Enum sayısına çevirmeliyiz
        const planTypeValue = res.planName === 'Yıllık' ? 2 : 1;

        this.editForm.patchValue({
          status: res.status, // Backend'den gelen status (Enum int değeri)
          planType: planTypeValue,
          amount: res.amount,
          isPaid: res.isPaid,
          note: res.note
        });
        
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  get f() { return this.editForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.editForm.invalid) return;

    this.isLoading = true;
    const formVal = this.editForm.value;

    const request: UpdateSubscriptionRequest = {
      id: this.subscriptionId!,
      status: Number(formVal.status), // YENİ: Status gönderimi
      planType: Number(formVal.planType),
      amount: formVal.amount,
      isPaid: formVal.isPaid,
      note: formVal.note
    };

    this.subService.updateSubscription(request).subscribe({
      next: () => {
        Swal.fire({
            icon: 'success',
            title: 'Güncellendi',
            text: 'Abonelik bilgileri başarıyla güncellendi.',
            timer: 1500,
            showConfirmButton: false
        }).then(() => {
            this.router.navigate(['/admin/subscriptions/list']);
        });
      },
      error: (err) => {
        this.isLoading = false;
        Swal.fire({
            icon: 'error',
            title: 'Hata',
            text: err.error?.messages?.[0] || 'Güncelleme başarısız oldu.'
        });
      }
    });
  }
}