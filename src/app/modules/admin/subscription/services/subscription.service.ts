import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service';

export enum SubscriptionPlanType {
  Monthly = 1,
  Yearly = 2
}

// 🔥 YENİ: Status Enum
export enum SubscriptionStatus {
  Active = 1,
  Expired = 2,
  Cancelled = 3
}

export interface AddSubscriptionRequest {
  tenantId: string;
  planType: number;
  amount: number;
  isPaid: boolean;
  note?: string;
}

export interface PaymentHistoryDto {
  id: string;
  status: SubscriptionStatus; // 🔥 YENİ
  planName: string;
  amount: number;
  isPaid: boolean;
  startDate: string;
  endDate: string;
  createdDate: string;
  note?: string;
}

// 🔥 YENİ: Güncelleme DTO'su (Status eklendi)
export interface UpdateSubscriptionRequest {
  id: string;
  status: number; // Enum value
  planType: number;
  amount: number;
  isPaid: boolean;
  note?: string;
}

// 🔥 YENİ: Gün Ayarı DTO'su
export interface AdjustDaysRequest {
  id: string; // 🔥 Değişti: TenantId yerine Id
  days: number;
}

@Injectable({
  providedIn: 'root'
})
export class SubscriptionService {
  private api = inject(BaseApiService);
  private endpoint = 'admin/subscription'; 

  // 1. SÜRE EKLE
  addSubscription(data: AddSubscriptionRequest) {
    return this.api.post<string>(this.endpoint, data);
  }

  // 2. GEÇMİŞİ GETİR
  getHistory(tenantId: string) {
    return this.api.get<PaymentHistoryDto[]>(`${this.endpoint}/history/${tenantId}`);
  }

  // 3. TEKİL GETİR
  getById(id: string) {
    return this.api.get<PaymentHistoryDto>(`${this.endpoint}/${id}`);
  }

  // 4. GÜNCELLE
  updateSubscription(data: UpdateSubscriptionRequest) {
    return this.api.put<string>(this.endpoint, data);
  }

  // 5. SİL
  deleteSubscription(id: string) {
    return this.api.delete<string>(`${this.endpoint}/${id}`);
  }

 adjustDays(data: AdjustDaysRequest) {
    return this.api.post<string>(`${this.endpoint}/adjust-days`, data);
  }
}