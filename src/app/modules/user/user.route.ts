import { Routes } from '@angular/router';
import { UserDashboardComponent } from './dashboard/dashboard.component';
import { FaqsComponent } from './faqs/faqs.component';
import { HelpCenterComponent } from './help-center/help-center.component';
import { ProfileComponent } from './profile/profile.component';
import { MultiplierSettingsComponent } from './multiplier-settings/multiplier-settings.component';
import { TodoComponent } from './apps/todo/todo.component';

export const USER_ROUTES: Routes = [
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  // 2. KURAL: Asıl dashboard rotası
  {
    path: 'dashboard',
    data: { title: 'User Dashboard' },
    component: UserDashboardComponent
  },
  {
    path: 'faqs',
    data: { title: 'User Dashboard' },
    component: FaqsComponent
  },
  {
    path: 'help-center',
    data: { title: 'User Dashboard' },
    component: HelpCenterComponent
  },
  {
    path: 'profile',
    data: { title: 'User Dashboard' },
    component: ProfileComponent
  },
  {
    path: 'multiplier-settings',
    data: { title: 'User Dashboard' },
    component: MultiplierSettingsComponent
  },
  {
    path: 'apps/todo',
    data: { title: 'User Dashboard' },
    component: TodoComponent
  }
];
