import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { SymbolService, CategoryDto } from '../services/symbol.service';

@Component({
  selector: 'app-symbol-add',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './symbol-add.component.html'
})
export class SymbolAddComponent implements OnInit {
  private fb = inject(FormBuilder);
  private symbolService = inject(SymbolService);
  private router = inject(Router);

  addForm!: FormGroup;
  submitted = false;
  isLoading = false;
  categoryList: CategoryDto[] = [];

  constructor() {
    this.addForm = this.fb.group({
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.symbolService.getAllCategories().subscribe(res => {
      this.categoryList = res;
    });
  }

  get f() { return this.addForm.controls; }

  onSubmit() {
    this.submitted = true;
    if (this.addForm.invalid) return;

    this.isLoading = true;
    this.symbolService.create(this.addForm.value).subscribe({
      next: () => {
        this.router.navigate(['/admin/symbols/list']);
      },
      error: () => this.isLoading = false,
      complete: () => this.isLoading = false
    });
  }
}