import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service';
import { Observable } from 'rxjs';
import { TenantCategory, UpdateCategoryNameDto } from '@/app/core/models/tenant-category.model';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private api = inject(BaseApiService);
  
  // Backend'deki Route: [Route("api/customer/[controller]")]
  private endpoint = 'customer/category';

  // 1. Kategorileri Listele
  getCategories(): Observable<TenantCategory[]> {
    // Backend: GET api/customer/category/list
    return this.api.get<TenantCategory[]>(`${this.endpoint}/list`);
  }

  // 2. Kategori İsmini Güncelle
  updateCategoryName(id: string, name: string) {
    // Backend: PUT api/customer/category/update/{id}
    const payload: UpdateCategoryNameDto = { name: name };
    return this.api.put<string>(`${this.endpoint}/update/${id}`, payload);
  }
}