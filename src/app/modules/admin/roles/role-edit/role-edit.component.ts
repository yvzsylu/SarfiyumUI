import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { RoleService, RoleDto } from '../services/role.service';

@Component({
  selector: 'app-role-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './role-edit.component.html',
})
export class RoleEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private roleService = inject(RoleService);

  roleForm: FormGroup;
  roleId: string | null = null;
  submitted = false;
  isLoading = false;

  constructor() {
    this.roleForm = this.fb.group({
      id: [''], // ID gizli olarak tutulacak
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  ngOnInit(): void {
    // URL'den ID'yi al
    this.roleId = this.route.snapshot.paramMap.get('id');
    
    if (this.roleId) {
      this.loadRoleData(this.roleId);
    } else {
      // ID yoksa listeye geri at
      this.router.navigate(['/admin/roles/list']);
    }
  }

  // Mevcut veriyi backend'den çek
  loadRoleData(id: string) {
    this.isLoading = true;
    // NOT: Backend'de GetById endpoint'i yazmamıştık ama RoleService.getAllRoles() içinde 
    // filtreleyerek bulabiliriz veya backend'e GetById ekleyebiliriz.
    // Şimdilik GetAll yapıp filtreliyorum (Backend'e GetById eklemek daha doğrudur).
    
    this.roleService.getAllRoles().subscribe({
      next: (roles) => {
        const role = roles.find(r => r.id === id);
        if (role) {
          this.roleForm.patchValue({
            id: role.id,
            name: role.name
          });
        }
        this.isLoading = false;
      },
      error: () => {
        this.router.navigate(['/admin/roles/list']);
      }
    });
  }

  get f() { return this.roleForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.roleForm.invalid) return;

    this.isLoading = true;
    
    // Formdaki veriyi RoleDto formatında al
    const roleData: RoleDto = this.roleForm.value;

    this.roleService.updateRole(roleData).subscribe({
      next: () => {
        this.router.navigate(['/admin/roles/list']);
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