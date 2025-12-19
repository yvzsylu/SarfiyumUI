import { Injectable, inject } from '@angular/core';
import { BaseApiService } from '@/app/core/services/base-api.service';

export interface DashboardStats {
  totalTenants: number;
  totalUsers: number;
  totalActiveSubscriptions: number;
  totalRevenue: number;
  totalPendingAmount: number;
  monthlyRevenue: { month: string; paidAmount: number; pendingAmount: number }[];
  activeSubsCount: number;
  expiredSubsCount: number;
  monthlyPlanCount: number;
  yearlyPlanCount: number;
  unpaidTenants: { tenantId: string; tenantName: string; planName: string; amount: number; dueDate: string }[];
  expiringTenants: { tenantName: string; endDate: string; remainingDays: number }[];
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private api = inject(BaseApiService);

  getStats() {
    return this.api.get<DashboardStats>('admin/dashboard/stats');
  }
}