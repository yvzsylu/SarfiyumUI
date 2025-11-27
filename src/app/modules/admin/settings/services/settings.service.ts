import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service';
import { Observable } from 'rxjs';

// DTO: Backend'deki SmtpSettingsDto ile birebir aynı olmalı
export interface SmtpSettingsDto {
  host: string;
  port: number;
  email: string;
  password: string;
  enableSsl: boolean;
  displayName: string;
}

// Backend'deki GlobalSettingsDto yapısı (Geleceğe hazırlık)
export interface GlobalSettingsDto {
  smtp: SmtpSettingsDto;
}

@Injectable({
  providedIn: 'root'
})
export class SettingsService {
  private api = inject(BaseApiService);
  private endpoint = 'admin/settings'; // Controller Route

  // 1. Tüm Ayarları Getir
  getAllSettings(): Observable<GlobalSettingsDto> {
    return this.api.get<GlobalSettingsDto>(this.endpoint);
  }

  // 2. Sadece SMTP Ayarlarını Güncelle
  updateSmtpSettings(data: SmtpSettingsDto) {
    return this.api.put<string>(`${this.endpoint}/smtp`, data);
  }
}