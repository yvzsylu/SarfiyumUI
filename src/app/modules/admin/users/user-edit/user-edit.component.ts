import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { NgxMaskDirective, provideNgxMask } from 'ngx-mask';

// Servisler
import { UserService, UpdateUserDto, UserDetailDto } from '../services/user.service';
import { RoleService, RoleDto } from '../../roles/services/role.service';
import { CustomerService, CustomerDto } from '../../customer/services/customer.service';

@Component({
  selector: 'app-user-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  providers: [provideNgxMask()],
  templateUrl: './user-edit.component.html',
})
export class UserEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private userService = inject(UserService);
  private roleService = inject(RoleService);
  private customerService = inject(CustomerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editForm!: FormGroup;
  submitted = false;
  isLoading = false;
  userId: string | null = null;
  currentUserData: UserDetailDto | null = null;

  // Dropdown Data
  roleList: RoleDto[] = [];
  tenantList: CustomerDto[] = [];

  constructor() {
    this.editForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      isActive: [true], // Aktif/Pasif durumu

      // Şifre Alanları (EDİT MODUNDA ZORUNLU DEĞİL)
      // Sadece pattern ve minLength validatörleri kalır, required kaldırılır.
      password: ['', [Validators.minLength(6), this.passwordPatternValidator]],
      confirmPassword: [''],

      // Atama Alanları
      roleId: ['', Validators.required],
      tenantId: [null]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    
    if (this.userId) {
      this.loadInitialData();
    } else {
      this.router.navigate(['/admin/users/list']);
    }
  }

  loadInitialData() {
    this.isLoading = true;

    // 1. Önce Dropdown verilerini çekiyoruz (Roller ve Tenantlar)
    // ForkJoin kullanılabilir ama basitlik adına iç içe yapıyorum veya ayrı ayrı subscribe oluyorum.
    
    this.roleService.getAllRoles().subscribe(roles => {
      this.roleList = roles;
      
      this.customerService.getAll().subscribe(tenants => {
        this.tenantList = tenants;
        
        // 2. Dropdownlar hazır olunca Kullanıcıyı çek ve doldur
        this.loadUserData();
      });
    });
  }

  loadUserData() {
    if (!this.userId) return;

    this.userService.getById(this.userId).subscribe({
      next: (user) => {
        this.currentUserData = user;
        
        // Backend'den gelen Rol İsmini (örn: "Admin"), Rol ID'sine çevirmemiz lazım
        // Çünkü dropdown ID ile çalışıyor.
        const foundRole = this.roleList.find(r => user.roles.includes(r.name));
        const roleIdToSelect = foundRole ? foundRole.id : '';

        this.editForm.patchValue({
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          isActive: user.isActive,
          tenantId: user.tenantId || null,
          roleId: roleIdToSelect,
          password: '', // Şifre boş gelir
          confirmPassword: ''
        });
        
        this.isLoading = false;
      },
      error: () => {
        this.router.navigate(['/admin/users/list']);
      }
    });
  }

  // --- VALIDATION ---
  passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    
    // Eğer şifre alanı boşsa (değiştirilmiyorsa) validasyon yapma
    if (!password) return null;

    return password === confirmPassword ? null : { mismatch: true };
  }

  passwordPatternValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value || '';
    if (!value) return null; // Boşsa geçerli say (Edit modu)

    const hasUpper = /[A-Z]/.test(value);
    const hasLower = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    const hasSpecial = /[^a-zA-Z0-9]/.test(value);
    return (hasUpper && hasLower && hasNumber && hasSpecial) ? null : { weakPassword: true };
  }

  checkPasswordRule(rule: string): boolean {
    const pass = this.editForm.get('password')?.value || '';
    if (!pass) return false; // Şifre yoksa kural gösterme
    
    switch (rule) {
      case 'length': return pass.length >= 6;
      case 'upper': return /[A-Z]/.test(pass);
      case 'lower': return /[a-z]/.test(pass);
      case 'number': return /[0-9]/.test(pass);
      case 'special': return /[^a-zA-Z0-9]/.test(pass);
      default: return false;
    }
  }
  
  get f() { return this.editForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.editForm.invalid) return;

    this.isLoading = true;
    const formVal = this.editForm.value;

    const updateData: UpdateUserDto = {
      id: this.userId!,
      username: formVal.username,
      email: formVal.email,
      fullName: formVal.fullName,
      isActive: formVal.isActive,
      roleId: formVal.roleId,
      // Tenant "null" string gelirse null yap
      tenantId: formVal.tenantId === 'null' ? null : formVal.tenantId,
      
      // DÜZELTME BURADA:
      // Eğer şifre boş string ("") ise null gönder. Doluysa kendisini gönder.
      password: formVal.password ? formVal.password : null 
    };

    this.userService.updateUser(updateData).subscribe({
      next: () => {
        this.router.navigate(['/admin/users/list']);
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