import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service';
import { Observable } from 'rxjs';

export interface TenantProductDto {
  id: string;
  name: string;
  sourceKey: string;
  categoryId: string; // <-- Kategori ID'si eklendi (eşleştirme için)
  categoryName: string;
  buyMultiplier: number;
  sellMultiplier: number;
  addonAmount: number;
  isActive: boolean;
}

export interface UpdateTenantProductDto {
  id: string;
  name: string;
  categoryId?: string; // <-- Opsiyonel: Kategori değişimi için
  sourceKey?: string;  // <-- Opsiyonel: Kaynak değişimi için
  buyMultiplier: number;
  sellMultiplier: number;
  addonAmount: number;
  isActive: boolean;
}

export interface CreateTenantProductDto {
  name: string;
  categoryId: string;
  sourceKey: string;
  buyMultiplier: number;
  sellMultiplier: number;
  addonAmount: number;
  orderIndex: number;
}

export interface CategoryDto {
  id: string;
  name: string;
  orderIndex: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private api = inject(BaseApiService);
  private endpoint = 'customer/product'; 

  getProducts(): Observable<TenantProductDto[]> {
    return this.api.get<TenantProductDto[]>(this.endpoint + '/list');
  }

  getCategories(): Observable<CategoryDto[]> {
    return this.api.get<CategoryDto[]>(this.endpoint + '/categories');
  }

  updateProducts(data: UpdateTenantProductDto[]) {
    return this.api.put<string>(this.endpoint + '/update-all', data);
  }

  createProduct(data: CreateTenantProductDto) {
    return this.api.post<string>(this.endpoint + '/create', data);
  }

  deleteProduct(id: string) {
    return this.api.delete<string>(`${this.endpoint}/${id}`);
  }

  toggleStatus(id: string, isActive: boolean) {
    return this.api.patch<string>(`${this.endpoint}/status/${id}`, isActive);
  }
}