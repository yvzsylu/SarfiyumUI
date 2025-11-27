import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthenticationService } from '@/app/core/services/auth.service';
import { LogoBoxComponent } from '@component/logo-box.component';
import { ToastrService } from 'ngx-toastr';

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

    this.authService.resetPassword(email).subscribe({
      next: (message) => {
        this.isLoading = false;
        this.toastr.success(message, 'Başarılı');
        // Kullanıcıyı login sayfasına yönlendir (veya mesajı okuması için beklet)
        setTimeout(() => this.router.navigate(['/auth/login']), 3000);
      },
      error: (err) => {
        this.isLoading = false;
        // Hata mesajı BaseService veya Interceptor tarafından gösterilmiyorsa burada göster:
        const errorMsg = err.message || 'Bir hata oluştu.';
        this.toastr.error(errorMsg, 'Hata');
      }
    });
  }
}