import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service';
import { Observable } from 'rxjs';

export interface SymbolCategoryDto {
  id: string;
  name: string;
}

export interface CreateUpdateSymbolCategoryDto {
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class SymbolCategoryService {
  private api = inject(BaseApiService);
  // Backend'deki endpoint değişmediyse 'admin/category' kalabilir, 
  // yoksa backend route'unu da değiştirdiysen burayı güncelle.
  private endpoint = 'admin/symbolcategory'; 

  // 1. Listele
  getAll(): Observable<SymbolCategoryDto[]> {
    return this.api.get<SymbolCategoryDto[]>(this.endpoint);
  }

  // 2. Get By Id
  getById(id: string): Observable<SymbolCategoryDto> {
    return this.api.get<SymbolCategoryDto>(`${this.endpoint}/${id}`);
  }

  // 3. Ekle
  create(data: CreateUpdateSymbolCategoryDto) {
    return this.api.post<string>(this.endpoint, data);
  }

  // 4. Güncelle
  update(id: string, data: CreateUpdateSymbolCategoryDto) {
    return this.api.put<string>(`${this.endpoint}/${id}`, data);
  }

  // 5. Sil
  delete(id: string) {
    return this.api.delete<string>(`${this.endpoint}/${id}`);
  }
}