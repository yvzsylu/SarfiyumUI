import { Routes } from '@angular/router';
import { AdminDashboardComponent } from '../dashboard/dashboard.component';

export const ADMIN_ROUTES: Routes = [
  // 1. KURAL: Eğer sadece '/admin' gelirse, 'admin-dashboard'a yönlendir
  { 
    path: '', 
    redirectTo: 'admin-dashboard', 
    pathMatch: 'full' 
  },
  // 2. KURAL: Asıl dashboard rotası
  {
    path: 'admin-dashboard',
    data: { title: 'Admin Dashboard' },
    component: AdminDashboardComponent
  }
];