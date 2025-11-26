import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service';

// Backend: TenantDto
export interface CustomerDto {
  id?: string;
  name: string;
  taxNumber: string;
  phoneNumber: string;
  website?: string;
  isActive: boolean;
  // Adres
  city: string;
  district: string;
  fullAddress?: string;
  zipCode?: string;
}

// Backend: CreateTenantWithUserDto
export interface CreateCustomerWithUserDto {
  // Firma
  name: string;
  taxNumber: string;
  phoneNumber: string;
  website?: string;
  city: string;
  district: string;
  fullAddress?: string;
  zipCode?: string;

  // Yetkili
  username: string;
  email: string;
  password: string;
  fullName: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  private api = inject(BaseApiService);
  // Backend rotası 'admin/Tenant' idi, frontend'de Customer desek de backend rotası değişmez.
  private endpoint = 'admin/tenant'; 

  // 1. Hepsini Getir
  getAll() {
    return this.api.get<CustomerDto[]>(this.endpoint);
  }

  // 2. ID ile Getir
  getById(id: string) {
    return this.api.get<CustomerDto>(`${this.endpoint}/${id}`);
  }

  // 3. YENİ OLUŞTUR (Firma + Kullanıcı)
  createWithUser(data: CreateCustomerWithUserDto) {
    return this.api.post<string>(`${this.endpoint}/create-with-user`, data);
  }

  // 4. GÜNCELLE (Sadece Firma Bilgileri)
  update(data: CustomerDto) {
    return this.api.put<string>(this.endpoint, data);
  }

  // 5. SİL
  delete(id: string) {
    return this.api.delete<string>(`${this.endpoint}/${id}`);
  }

  // STATUS GÜNCELLEME (PATCH)
  updateStatus(id: string, isActive: boolean) {
    return this.api.patch<string>(`${this.endpoint}/${id}/status`, { isActive });
  }
}