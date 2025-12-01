import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SymbolCategoryService } from '../services/symbol-category.service';

@Component({
  selector: 'app-symbol-category-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './symbol-category-add.component.html'
})
export class SymbolCategoryAddComponent {
  private fb = inject(FormBuilder);
  private categoryService = inject(SymbolCategoryService);
  private router = inject(Router);

  addForm: FormGroup;
  submitted = false;
  isLoading = false;

  constructor() {
    this.addForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  get f() { return this.addForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.addForm.invalid) return;

    this.isLoading = true;
    this.categoryService.create(this.addForm.value).subscribe({
      next: () => {
        this.router.navigate(['/admin/symbol-categories/list']);
      },
      error: () => this.isLoading = false,
      complete: () => this.isLoading = false
    });
  }
}