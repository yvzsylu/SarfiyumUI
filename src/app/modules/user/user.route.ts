import { Routes } from '@angular/router';
import { UserDashboardComponent } from './dashboard/dashboard.component';
import { FaqsComponent } from './faqs/faqs.component';
import { HelpCenterComponent } from './help-center/help-center.component';
import { ProfileComponent } from './profile/profile.component';
import { MultiplierSettingsComponent } from './multiplier-settings/multiplier-settings.component';
import { TodoComponent } from './apps/todo/todo.component';
import { AuthGuard } from '@/app/core/guards/auth.guard';


export const USER_ROUTES: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full'
  },

  // 1. Piyasa Ekranı (Hem User hem Viewer Erişebilir)
  {
    path: 'dashboard',
    component: UserDashboardComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Piyasa Ekranı',
      roles: ['user', 'viewer']
    }
  },

  // 2. Çarpan Ayarları (SADECE User Erişebilir - Viewer GİREMEZ)
  {
    path: 'multiplier-settings',
    component: MultiplierSettingsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Çarpan Ayarları',
      roles: ['user']
    }
  },

  // 3. Profil Ayarları (Herkes Erişebilir)
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Profilim',
      roles: ['user']
    }
  },

  // 4. Sıkça Sorulan Sorular
  {
    path: 'faqs',
    component: FaqsComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'S.S.S',
      roles: ['user', 'viewer']
    }
  },

  // 5. Yardım Merkezi
  {
    path: 'help-center',
    component: HelpCenterComponent,
    canActivate: [AuthGuard],
    data: {
      title: 'Yardım Merkezi',
      roles: ['user', 'viewer']
    }
  },
  {
    path: 'viewers',
    loadChildren: () =>
      import('../user/viewers/viewer.route').then(m => m.VIEWER_ROUTES)
  },

  // 6. Todo / İş Listesi (Genelde yönetimseldir, sadece User'a bıraktım)
  // {
  //   path: 'apps/todo',
  //   component: TodoComponent,
  //   canActivate: [AuthGuard],
  //   data: { 
  //     title: 'Yapılacaklar Listesi', 
  //     roles: ['user'] 
  //   }
  // }
];