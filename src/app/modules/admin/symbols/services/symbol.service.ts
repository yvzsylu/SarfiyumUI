import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service';
import { Observable } from 'rxjs';

// --- DTO TANIMLARI ---

export interface SymbolListDto {
  id: string;
  name: string;
  categoryName: string;
  categoryId: string;
  isActive: boolean;
}

export interface CreateUpdateSymbolDto {
  name: string;
  categoryId: string; // Kategori ID'si (Backend bu ismi bekler)
  isActive: boolean;
}

// Kategoriler için basit DTO (Dropdown için)
export interface CategoryDto {
  id: string;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class SymbolService {
  private api = inject(BaseApiService);
  private endpoint = 'admin/symbol'; // Backend Controller Route

  // 1. Tüm Sembolleri Getir
  getAllSymbols(): Observable<SymbolListDto[]> {
    return this.api.get<SymbolListDto[]>(this.endpoint);
  }

  // 2. ID ile Getir (Edit için)
  // NOT: Backend'de GetById metodu yoksa GetAll içinden filtreleyebiliriz 
  // veya backend'e [HttpGet("{id}")] eklemen gerekebilir.
  // Şimdilik GetAll içinden bulma yöntemiyle ilerleyelim veya backend'e endpoint ekleyelim.
  // Varsayım: Backend'de GetById endpoint'i var.
  getById(id: string): Observable<SymbolListDto> {
    return this.api.get<SymbolListDto>(`${this.endpoint}/${id}`);
  }

  // 3. Ekle
  create(data: CreateUpdateSymbolDto) {
    return this.api.post<string>(this.endpoint, data);
  }

  // 4. Güncelle
  update(id: string, data: CreateUpdateSymbolDto) {
    return this.api.put<string>(`${this.endpoint}/${id}`, data);
  }

  // 5. Sil
  delete(id: string) {
    return this.api.delete<string>(`${this.endpoint}/${id}`);
  }

  // 6. Durum Değiştir
  toggleStatus(id: string) {
    return this.api.patch<string>(`${this.endpoint}/${id}/status`, {});
  }

  // 7. Kategorileri Getir (Dropdown İçin)
  // Backend'de ayrı bir kategori endpointi yoksa, sembollerden unique liste çıkarabiliriz.
  // Ama doğrusu ayrı bir endpoint olmasıdır. Şimdilik manuel kategori listesi veya endpoint varsayalım.
  // Varsayım: Admin/Category endpointi var.
  getAllCategories(): Observable<CategoryDto[]> {
    // Eğer backend'de kategori endpoint'i yoksa burayı mock data ile veya 
    // Symbol listesinden filtreleyerek çözebiliriz.
    return this.api.get<CategoryDto[]>('admin/symbolcategory'); 
  }
}