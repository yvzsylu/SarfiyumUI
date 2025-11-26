import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CustomerService, CreateCustomerWithUserDto } from '../services/customer.service';
import { Cities, City } from '@/app/core/data/turkey-data';

// Maskeleme İçin
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

@Component({
  selector: 'app-customer-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgxMaskDirective], // Mask Directive eklendi
  providers: [provideNgxMask()], // Mask Provider eklendi
  templateUrl: './customer-add.component.html',
})
export class CustomerAddComponent implements OnInit {
  private fb = inject(FormBuilder);
  private customerService = inject(CustomerService);
  private router = inject(Router);

  addForm: FormGroup;
  submitted = false;
  isLoading = false;

  cityList: City[] = Cities;
  districtList: string[] = [];

  constructor() {
    this.addForm = this.fb.group({
      // --- FİRMA BİLGİLERİ ---
      name: ['', Validators.required],
      taxNumber: ['', [Validators.required, Validators.minLength(11)]], // Maske ile birlikte uzunluk kontrolü
      phoneNumber: ['', Validators.required],
      website: [''],
      
      // Adres (Sadeleştirildi)
      city: ['', Validators.required],
      district: ['', Validators.required],
      zipCode: ['', [Validators.minLength(5)]],
      fullAddress: ['', Validators.required], // Tek alan oldu (Textarea)

      // --- YETKİLİ KİŞİ ---
      fullName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      
      // Şifre Alanları
      password: ['', [
        Validators.required, 
        Validators.minLength(6),
        this.passwordPatternValidator // Özel şifre kuralı kontrolü
      ]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator }); // Form genelinde şifre eşleşme kontrolü
  }

  ngOnInit() {
    this.addForm.get('city')?.valueChanges.subscribe(selectedCityName => {
      this.onCityChange(selectedCityName);
    });
  }

  onCityChange(cityName: string) {
    const selectedCity = this.cityList.find(c => c.name === cityName);
    this.districtList = selectedCity ? selectedCity.districts : [];
    this.addForm.get('district')?.setValue('');
  }

  get f() { return this.addForm.controls; }

  // --- ŞİFRE KONTROLLERİ ---

  // 1. Şifre Eşleşme Kontrolü
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  // 2. Identity Şifre Kuralları (Regex)
  // Bu sadece form validasyonu için, görsel renklendirme HTML tarafında yapılacak
  passwordPatternValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    // En az 1 büyük, 1 küçük, 1 rakam, 1 özel karakter
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[^a-zA-Z0-9]/.test(value);

    const valid = hasUpper && hasLower && hasNumber && hasSpecial;
    return valid ? null : { weakPassword: true };
  }

  // HTML'de kuralları renklendirmek için yardımcı metot
  checkPasswordRule(rule: string): boolean {
    const pass = this.addForm.get('password')?.value || '';
    switch (rule) {
      case 'length': return pass.length >= 6;
      case 'upper': return /[A-Z]/.test(pass);
      case 'lower': return /[a-z]/.test(pass);
      case 'number': return /[0-9]/.test(pass);
      case 'special': return /[^a-zA-Z0-9]/.test(pass);
      default: return false;
    }
  }

  onSubmit() {
    this.submitted = true;
    if (this.addForm.invalid) return;

    this.isLoading = true;
    
    // Form verisini DTO'ya mapliyoruz
    // Street alanını backend beklediği için fullAddress'i oraya da kopyalıyoruz
    const formVal = this.addForm.value;
    
    const formData: CreateCustomerWithUserDto = {
      ...formVal,
      street: formVal.fullAddress // Backend street bekliyorsa burayı dolduruyoruz
    };

    // Confirm password backend'e gitmemeli, zaten DTO'da yok, sorun olmaz.

    this.customerService.createWithUser(formData).subscribe({
      next: () => {
        this.router.navigate(['/admin/customers/list']);
      },
      error: () => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}