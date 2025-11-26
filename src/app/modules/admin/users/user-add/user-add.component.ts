import { Component, OnInit, inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';

// Servisler ve Modeller
import { UserService, CreateUserDto } from '../services/user.service'; 
import { RoleService, RoleDto } from '../../roles/services/role.service';
import { CustomerService, CustomerDto } from '../../customer/services/customer.service';

// Maskeleme (HTML'de kullanılmasa bile TS'de provider olarak lazımdı)
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';


@Component({
  selector: 'app-user-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [provideNgxMask()], 
  templateUrl: './user-add.component.html',
  styleUrl: './user-add.component.scss', // Style'ı korumak için
  // Angular'ın default Encapsulation ayarını kullanıyoruz
})
export class UserAddComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);
  
  // DROPDOWN SERVİSLERİ
  private roleService = inject(RoleService); 
  private customerService = inject(CustomerService);

  addForm!: FormGroup; // ! Kullanıldı
  submitted = false;
  isLoading = false;

  // DROPDOWN STATE
  roleList: RoleDto[] = [];
  tenantList: CustomerDto[] = []; 

  constructor() {
    this.addForm = this.fb.group({
      // --- KULLANICI BİLGİLERİ (ESKİ YAPIDAN GELDİ) ---
      fullName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      
      // Şifre Alanları
      password: ['', [Validators.required, Validators.minLength(6), this.passwordPatternValidator]],
      confirmPassword: ['', Validators.required],

      // --- ATAMA DROPDOWNLARI ---
      roleId: ['', Validators.required], // Rol zorunlu
      tenantId: [null] // Tenant opsiyonel (Admin için null)
      
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.loadDropdownData();
  }
  
  loadDropdownData() {
    // 1. Tüm Rolleri Çek (Required)
    this.roleService.getAllRoles().subscribe(roles => {
      this.roleList = roles;
    });

    // 2. Tüm Tenantları Çek (Opsiyonel)
    this.customerService.getAll().subscribe(tenants => {
      this.tenantList = tenants;
    });
  }

  // --- VALIDATION METOTLARI (Aynen Kalır) ---
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  passwordPatternValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[^a-zA-Z0-9]/.test(value);
    const valid = hasUpper && hasLower && hasNumber && hasSpecial;
    return valid ? null : { weakPassword: true };
  }

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
  // --- END VALIDATION ---
  
  get f() { return this.addForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.addForm.invalid) return;

    this.isLoading = true;
    
    const formVal = this.addForm.value;
    
    const formData: CreateUserDto = {
      username: formVal.username,
      email: formVal.email,
      password: formVal.password,
      fullName: formVal.fullName,
      roleId: formVal.roleId,
      // TenantId boş string gelirse null yap (Backend'deki string? TenantId'ye uygun)
      tenantId: formVal.tenantId === '' ? null : formVal.tenantId 
    };

    this.userService.createUser(formData).subscribe({
      next: () => {
        this.router.navigate(['/admin/users/list']); // Yeni User Listesi rotası (Örnek)
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