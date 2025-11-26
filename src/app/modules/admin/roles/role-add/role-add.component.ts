import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common'; // *ngIf ve [ngClass] için ŞART
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms'; // [formGroup] için ŞART
import { Router, RouterModule } from '@angular/router'; // routerLink için ŞART
import { RoleService } from '../services/role.service';

@Component({
  selector: 'app-role-add',
  standalone: true,
  // HTML'de kullandığın her şeyi buraya eklemek zorundasın:
  imports: [
    CommonModule,         // *ngIf, [ngClass]
    ReactiveFormsModule,  // [formGroup], formControlName
    RouterModule          // routerLink
  ],
  templateUrl: './role-add.component.html',
})
export class RoleAddComponent {
  private fb = inject(FormBuilder);
  private roleService = inject(RoleService);
  private router = inject(Router);

  // HTML'de kullandığın değişkenler burada tanımlı olmalı
  roleForm: FormGroup;
  submitted = false;
  isLoading = false;

  constructor() {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  // HTML'de f['name'] diye kullanabilmek için bu getter ŞART
  get f() { return this.roleForm.controls; }

  onSubmit() {
    this.submitted = true;

    if (this.roleForm.invalid) {
      return;
    }

    this.isLoading = true;
    const roleName = this.roleForm.value.name;

    this.roleService.createRole(roleName).subscribe({
      next: () => {
        this.router.navigate(['/admin/roles/list']);
      },
      error: (err) => {
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}