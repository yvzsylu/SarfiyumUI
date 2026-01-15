import { Routes } from '@angular/router';
import { UserDashboardComponent } from './dashboard/dashboard.component';
import { FaqsComponent } from './faqs/faqs.component';
import { HelpCenterComponent } from './help-center/help-center.component';
import { ProfileComponent } from './profile/profile.component';
import { MultiplierSettingsComponent } from './multiplier-settings/multiplier-settings.component';
import { AuthGuard } from '@/app/core/guards/auth.guard';
import { CategorySettingsComponent } from './categories/category-settings/category-settings.component';
import { TenantSettingsComponent } from './tenant-settings/tenant-settings.component';
import { ContactComponent } from './contact/contact.component';

export const USER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // 1. DASHBOARD (Ortak Alan)
  {
    path: 'dashboard',
    component: UserDashboardComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Piyasa Ekranı',
      roles: ['user', 'viewer'] // Hem User hem Viewer girebilir
    }
  },

  // 2. USER ÖZEL ALANLARI (Sadece 'user' girebilir)
  {
    path: 'multiplier-settings',
    component: MultiplierSettingsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Çarpan Ayarları', roles: ['user'] }
  },
  {
    path: 'tenant-settings',
    component: TenantSettingsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Genel Ayarlar', roles: ['user'] }
  },
  {
    path: 'category-settings',
    component: CategorySettingsComponent,
    canActivate: [AuthGuard],
    data: { title: 'Kategori Ayarları', roles: ['user'] }
  },
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: { title: 'Profilim', roles: ['user'] }
  },

  // 3. ORTAK YARDIM ALANLARI
  {
    path: 'faqs',
    component: FaqsComponent,
    canActivate: [AuthGuard],
    data: { title: 'S.S.S', roles: ['user'] }
  },
  {
    path: 'help-center',
    component: HelpCenterComponent,
    canActivate: [AuthGuard],
    data: { title: 'Yardım Merkezi', roles: ['user'] }
  }, 
  {
    path: 'contact',
    component: ContactComponent,
    canActivate: [AuthGuard],
    data: { title: 'İletişim', roles: ['viewer'] }
  }
];