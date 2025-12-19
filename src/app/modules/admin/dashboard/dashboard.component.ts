import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateComponent } from './components/state/state.component';
import { PerformanceComponent } from './components/performance/performance.component';
import { ConversionsComponent } from './components/conversions/conversions.component';
import { SessionsCountryComponent } from './components/sessions-country/sessions-country.component';
import { TopPagesComponent } from './components/top-pages/top-pages.component';
import { RecentOrderComponent } from './components/recent-order/recent-order.component';
import { DashboardService, DashboardStats } from './services/dashboard.service';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    StateComponent,
    PerformanceComponent,
    ConversionsComponent,
    SessionsCountryComponent,
    TopPagesComponent,
    RecentOrderComponent,
  ],
  templateUrl: './dashboard.component.html',
})
export class AdminDashboardComponent implements OnInit {
  private dashboardService = inject(DashboardService);
  
  stats: DashboardStats | null = null;
  isLoading = true;

  ngOnInit() {
    this.dashboardService.getStats().subscribe({
      next: (res) => {
        this.stats = res;
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }
}