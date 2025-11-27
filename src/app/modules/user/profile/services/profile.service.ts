import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service';
import { Observable } from 'rxjs';

// Backend'deki UserProfileDto ile eşleşmeli
export interface UserProfileDto {
  // Kullanıcı Bilgileri
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  isUserActive: boolean;
  roles: string[];

  // Tenant Bilgileri
  tenantId?: string;
  tenantName?: string;
  tenantTaxNumber?: string;
  tenantPhoneNumber?: string;
  tenantWebsite?: string;
  tenantLogoUrl?: string;
  isTenantActive?: boolean;
  tenantCreatedAt?: string; // DateTime string gelir

  // Adres
  tenantCity?: string;
  tenantDistrict?: string;
  tenantCountry?: string;
  tenantZipCode?: string;
  tenantFullAddress?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ProfileService {
  private api = inject(BaseApiService);
  
  // Backend'deki Route: api/Profile/info
  private endpoint = 'customer/profile'; 

  getProfileInfo(): Observable<UserProfileDto> {
    return this.api.get<UserProfileDto>(this.endpoint + '/info');
  }

  uploadLogo(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    // Content-Type header'ını Angular otomatik ayarlar (multipart/form-data), elle yazma.
    return this.api.post<string>(this.endpoint + '/upload-logo', formData);
  }
}