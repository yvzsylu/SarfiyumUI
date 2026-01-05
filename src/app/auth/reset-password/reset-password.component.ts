import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '@/app/core/services/auth.service';
import { LogoBoxComponent } from '@component/logo-box.component';
import { ToastrService } from 'ngx-toastr';
// ServiceResult tipini import etmeyi unutma (Path projene göre değişebilir)
// import { ServiceResult } from '@/app/core/models/service-result.model'; 

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, LogoBoxComponent],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthenticationService);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  resetForm: FormGroup;
  submitted = false;
  isLoading = false;

  constructor() {
    this.resetForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  get f() { return this.resetForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.resetForm.invalid) {
      return;
    }

    this.isLoading = true;
    const email = this.resetForm.value.email;

    // Servis artık ServiceResult<string> dönüyor
    this.authService.resetPassword(email).subscribe({
      next: (res) => { 
        this.isLoading = false;

        // 🔥 DÜZELTME: isSuccess kontrolü ve data erişimi
        if (res.isSuccess) {
            // Başarılı mesajı 'res.data' içindedir
            this.toastr.success(res.data || 'İşlem başarılı.', 'Başarılı');
            
            // Yönlendirme
            setTimeout(() => this.router.navigate(['/auth/login']), 3000);
        } else {
            // Backend 200 dönse bile mantıksal hata varsa (örn: Kullanıcı pasif)
            const errorMsg = res.errors?.[0] || 'İşlem başarısız oldu.';
            this.toastr.error(errorMsg, 'Hata');
        }
      },
      error: (err) => {
        this.isLoading = false;
        // HTTP hataları (404, 500 vb.) buraya düşer
        let errorMsg = 'Bir hata oluştu.';
        
        if (err.error && err.error.errors && Array.isArray(err.error.errors)) {
             errorMsg = err.error.errors[0];
        } else if (err.message) {
             errorMsg = err.message;
        }

        this.toastr.error(errorMsg, 'Hata');
      }
    });
  }
}