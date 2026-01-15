import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service'; // Yolunu projene göre ayarla
import { Observable, map } from 'rxjs';

// Backend DTO'su ile eşleşen interface
export interface TenantSettingsDto {
  whatsAppNumber: string | null;
}

export interface UpdateTenantSettingsDto {
  whatsAppNumber: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TenantSettingsService {
  private api = inject(BaseApiService);
  private endpoint = 'customer/settings'; // Controller'daki [Route("api/settings")] ile eşleşmeli

  // Ayarları Getir
  getSettings(): Observable<TenantSettingsDto> {
    return this.api.get<any>(this.endpoint).pipe(
      map(response => {
        // Backend ServiceResult dönüyorsa response.data, direkt obje dönüyorsa response
        return response['data'] ? response['data'] : response;
      })
    );
  }

  // Ayarları Güncelle
  updateSettings(data: UpdateTenantSettingsDto): Observable<any> {
    return this.api.put<any>(this.endpoint, data);
  }
}