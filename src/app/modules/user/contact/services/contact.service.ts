import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service'; // Yolunu projene göre ayarla
import { Observable, map } from 'rxjs';

export interface ContactInfoDto {
  whatsappNumber: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private api = inject(BaseApiService);
  // Backend'deki endpointin (ProductController veya SettingsController hangisiyse)
  // Genelde public veya user yetkili bir endpoint olmalı.
  // Örneğin: api/settings veya api/customer/product/settings
  private endpoint = 'customer/settings'; 

  getContactInfo(): Observable<ContactInfoDto> {
    return this.api.get<any>(this.endpoint).pipe(
      map(res => {
        // Backend yapısına göre data wrapper kontrolü
        const data = res['data'] ? res['data'] : res;
        
        return {
          // Backend case-sensitivity garantisi
          whatsappNumber: data.whatsappNumber || data.whatsAppNumber || data.WhatsAppNumber || null
        } as ContactInfoDto;
      })
    );
  }
}