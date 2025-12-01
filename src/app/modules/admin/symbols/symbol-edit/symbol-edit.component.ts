import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { SymbolService, CategoryDto } from '../services/symbol.service';

@Component({
  selector: 'app-symbol-edit',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './symbol-edit.component.html' // Add ile aynı template kullanılabilir veya kopyalanabilir
})
export class SymbolEditComponent implements OnInit {
  private fb = inject(FormBuilder);
  private symbolService = inject(SymbolService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  editForm!: FormGroup;
  submitted = false;
  isLoading = false;
  symbolId: string | null = null;
  categoryList: CategoryDto[] = [];

  constructor() {
    this.editForm = this.fb.group({
      name: ['', Validators.required],
      categoryId: ['', Validators.required],
      isActive: [true]
    });
  }

  ngOnInit() {
    this.symbolId = this.route.snapshot.paramMap.get('id');
    if (!this.symbolId) {
      this.router.navigate(['/admin/symbols/list']);
      return;
    }

    this.loadInitialData();
  }

  loadInitialData() {
    this.isLoading = true;
    // Kategorileri ve Sembol detayını paralel çekebiliriz veya iç içe
    this.symbolService.getAllCategories().subscribe(cats => {
      this.categoryList = cats;
      
      this.symbolService.getById(this.symbolId!).subscribe(symbol => {
        this.editForm.patchValue({
          name: symbol.name,
          categoryId: symbol.categoryId,
          isActive: symbol.isActive
        });
        this.isLoading = false;
      });
    });
  }

  onSubmit() {
    this.submitted = true;
    if (this.editForm.invalid) return;

    this.isLoading = true;
    this.symbolService.update(this.symbolId!, this.editForm.value).subscribe({
      next: () => {
        this.router.navigate(['/admin/symbols/list']);
      },
      error: () => this.isLoading = false,
      complete: () => this.isLoading = false
    });
  }
}