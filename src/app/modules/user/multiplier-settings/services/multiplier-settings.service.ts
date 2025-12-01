import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service';
import { Observable } from 'rxjs';

export interface TenantSettingDto {
  symbolId: string;
  symbolName: string;
  categoryName: string;
  buyMultiplier: number;
  sellMultiplier: number;
  addonAmount: number;
}

export interface UpdateTenantSettingDto {
  symbolId: string;
  buyMultiplier: number;
  sellMultiplier: number;
  addonAmount: number;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private api = inject(BaseApiService);
  private endpoint = 'customer/multiplier'; // Backend Controller Route

  // 1. Ayarları Getir
  getMultipliers(): Observable<TenantSettingDto[]> {
    return this.api.get<TenantSettingDto[]>(this.endpoint + '/multipliers');
  }

  // 2. Ayarları Güncelle
  updateMultipliers(data: UpdateTenantSettingDto[]) {
    return this.api.post<string>(this.endpoint + '/update-multipliers', data);
  }
}