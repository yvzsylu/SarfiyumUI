import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, UntypedFormBuilder, Validators, type UntypedFormGroup } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LogoBoxComponent } from '@component/logo-box.component';
import { Store } from '@ngrx/store';
import { login } from '@store/authentication/authentication.actions';
import { CommonModule } from '@angular/common'; // 1. EKLENDİ: *ngIf için gerekli

@Component({
  selector: 'app-login',
  // 2. GÜNCELLENDİ: CommonModule buraya eklendi
  imports: [LogoBoxComponent, RouterLink, FormsModule, ReactiveFormsModule, CommonModule], 
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  loginForm!: UntypedFormGroup;
  submitted: boolean = false;
  
  // 3. EKLENDİ: Loading durumunu tutan değişken
  isLoading: boolean = false; 

  public fb = inject(UntypedFormBuilder);
  public store = inject(Store);

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rememberMe: [false] // Varsayılan false
    });

    // --- OTOMATİK DOLDURMA ---
    const isRemembered = localStorage.getItem('is_remembered') === 'true';
    const savedUsername = localStorage.getItem('remembered_username');
    
    if (isRemembered && savedUsername) {
      this.loginForm.patchValue({
        username: savedUsername,
        rememberMe: true
      });
    }
  }

  get formValues() {
    return this.loginForm.controls;
  }

  login() {
    this.submitted = true;
    
    if (this.loginForm.valid) { 
      // 4. EKLENDİ: İşlem başladığında loading'i aç
      this.isLoading = true;

      const username = this.formValues['username'].value; 
      const password = this.formValues['password'].value; 
      const rememberMe = this.formValues['rememberMe'].value;

      // Login Api
      this.store.dispatch(login({ username: username, password: password, rememberMe: rememberMe }));

      // 5. EKLENDİ: Butonun sonsuza kadar dönmesini engellemek için timeout
      // (Store kullandığın için idealde hatayı/başarıyı dinleyip kapatmak gerekir ama bu pratik çözümdür)
      setTimeout(() => {
        this.isLoading = false;
      }, 2000);
    }
  }
}