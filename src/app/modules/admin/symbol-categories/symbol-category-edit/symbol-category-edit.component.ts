import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SymbolCategoryService } from '../services/symbol-category.service';

@Component({
  selector: 'app-symbol-category-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './symbol-category-edit.component.html'
})
export class SymbolCategoryEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private categoryService = inject(SymbolCategoryService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editForm: FormGroup;
  submitted = false;
  isLoading = false;
  categoryId: string | null = null;

  constructor() {
    this.editForm = this.fb.group({
      name: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.categoryId = this.route.snapshot.paramMap.get('id');
    if (!this.categoryId) {
      this.router.navigate(['/admin/symbol-categories/list']);
      return;
    }

    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    this.categoryService.getById(this.categoryId!).subscribe({
      next: (res) => {
        this.editForm.patchValue({
          name: res.name
        });
        this.isLoading = false;
      },
      error: () => {
        this.router.navigate(['/admin/symbol-categories/list']);
      }
    });
  }

  get f() { return this.editForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.editForm.invalid) return;

    this.isLoading = true;
    this.categoryService.update(this.categoryId!, this.editForm.value).subscribe({
      next: () => {
        this.router.navigate(['/admin/symbol-categories/list']);
      },
      error: () => this.isLoading = false,
      complete: () => this.isLoading = false
    });
  }
}