import { Routes } from '@angular/router';
import { AdminDashboardComponent } from './dashboard/dashboard.component';
import { ProfileComponent } from './profile/profile.component';
import { SettingsComponent } from './settings/settings.component';
import { FaqsComponent } from './faqs/faqs.component';
import { HelpCenterComponent } from './help-center/help-center.component';

export const ADMIN_ROUTES: Routes = [
  // 1. KURAL: Eğer sadece '/admin' gelirse, 'admin-dashboard'a yönlendir
  { 
    path: '', 
    redirectTo: 'dashboard', 
    pathMatch: 'full' 
  },
  // 2. KURAL: Asıl dashboard rotası
  {
    path: 'dashboard',
    data: { title: 'Admin Dashboard' },
    component: AdminDashboardComponent
  },
  {
    path: 'profile',
    data: { title: 'Admin Profil' },
    component: ProfileComponent
  },
  {
    path: 'settings',
    data: { title: 'Admin Ayarlar' },
    component: SettingsComponent  
  },
  // {
  //   path: 'users',
  //   data: { title: 'Admin Kullanıcılar' },
  //   component: UsersComponent
  // },
  {
    path: 'help-center',
    data: { title: 'Admin Yardım Merkezi' },
    component: HelpCenterComponent    
  },
  {
    path: 'faqs',
    data: { title: 'Admin SSS' },
    component: FaqsComponent  
  },
  // 3. KURAL: Customers Modülü (YENİ EKLENEN KISIM)
  // Bu sayede '/admin/customers/list' veya '/admin/customers/detail' çalışacak.
  {
    path: 'customers',
    loadChildren: () => 
      import('../admin/customer/customer.route').then(m => m.CUSTOMERS_ROUTES)
  },
  {
    path: 'roles',
    loadChildren: () => 
      import('../admin/roles/role.route').then(m => m.ROLE_ROUTES)
  },
  {
    path: 'users',
    loadChildren: () => 
      import('../admin/users/user.route').then(m => m.USER_ROUTES)
  },
    {
    path: 'symbols',
    loadChildren: () => 
      import('../admin/symbols/symbol.route').then(m => m.SYMBOL_ROUTES)
  },
    {
    path: 'symbol-categories',
    loadChildren: () => 
      import('../admin/symbol-categories/symbol-category.route').then(m => m.SYMBOL_CATEGORY_ROUTES)
  }
];