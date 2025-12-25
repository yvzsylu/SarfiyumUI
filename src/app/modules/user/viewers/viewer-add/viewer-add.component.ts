import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ViewerService } from '../services/viewer.service';
import { CreateUserDto } from '@/app/modules/admin/users/services/user.service';

@Component({
  selector: 'app-viewer-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './viewer-add.component.html'
})
export class ViewerAddComponent {
  private fb = inject(FormBuilder);
  private viewerService = inject(ViewerService);
  private router = inject(Router);

  addForm: FormGroup;
  submitted = false;
  isLoading = false;

  constructor() {
    this.addForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    }, { validators: this.matchPassword });
  }

  matchPassword(control: AbstractControl) {
    const pass = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    return pass === confirm ? null : { mismatch: true };
  }

  get f() { return this.addForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.addForm.invalid) return;

    this.isLoading = true;
    
    const dto: CreateUserDto = {
        ...this.addForm.value,
        roleId: 'dummy', // Backend otomatik Viewer atayacak
        tenantId: 'dummy' // Backend otomatik Token'dan alacak
    };

    this.viewerService.createViewer(dto).subscribe({
      next: () => {
        this.router.navigate(['/user/viewers/list']);
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }
}