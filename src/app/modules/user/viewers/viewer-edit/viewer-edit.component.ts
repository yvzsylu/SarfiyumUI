import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ViewerService } from '../services/viewer.service';
import { UpdateUserDto } from '@/app/modules/admin/users/services/user.service';

@Component({
  selector: 'app-viewer-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './viewer-edit.component.html'
})
export class ViewerEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private viewerService = inject(ViewerService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editForm: FormGroup;
  userId: string | null = null;
  isLoading = false;
  submitted = false;

  constructor() {
    this.editForm = this.fb.group({
      fullName: ['', Validators.required],
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      isActive: [true],
      password: [''],
      confirmPassword: ['']
    }, { validators: this.matchPassword });
  }

  matchPassword(control: AbstractControl) {
    const pass = control.get('password')?.value;
    const confirm = control.get('confirmPassword')?.value;
    
    // Şifre boşsa validasyon yapma (çünkü değişim opsiyonel)
    if(!pass) return null;
    
    return pass === confirm ? null : { mismatch: true };
  }

  get f() { return this.editForm.controls; }

  ngOnInit() {
    this.userId = this.route.snapshot.paramMap.get('id');
    if (this.userId) {
        this.loadData();
    } else {
        this.router.navigate(['/user/viewers/list']);
    }
  }

  loadData() {
    this.isLoading = true;
    this.viewerService.getViewerById(this.userId!).subscribe({
      next: (user) => {
        this.editForm.patchValue({
            fullName: user.fullName,
            username: user.username,
            email: user.email,
            isActive: user.isActive,
            password: '',
            confirmPassword: ''
        });
        this.isLoading = false;
      },
      error: () => {
        this.router.navigate(['/user/viewers/list']);
      }
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.editForm.invalid) return;
    
    this.isLoading = true;
    
    const dto: UpdateUserDto = {
        id: this.userId!,
        ...this.editForm.value,
        roleId: 'dummy',
        tenantId: 'dummy',
        password: this.editForm.value.password || null
    };

    this.viewerService.updateViewer(dto).subscribe({
        next: () => {
            this.router.navigate(['/user/viewers/list']);
        },
        error: () => {
            this.isLoading = false;
        }
    });
  }
}