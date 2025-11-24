import { Routes } from '@angular/router';
import { UserDashboardComponent } from '../dashboard/dashboard.component';

export const USER_ROUTES: Routes = [
  { 
    path: '', 
    redirectTo: 'user-dashboard', 
    pathMatch: 'full' 
  },
  // 2. KURAL: Asıl dashboard rotası
  {
    path: 'user-dashboard',
    data: { title: 'User Dashboard' },
    component: UserDashboardComponent
  }
];
