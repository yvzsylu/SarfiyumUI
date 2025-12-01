import { Routes } from '@angular/router';
// import { LayoutComponent } from './layouts/layout/layout.component';
import { AuthLayoutComponent } from '@layouts/shared/auth-layout/auth-layout.component';
import { AuthGuard } from './core/guards/auth.guard';
import { AdminLayoutComponent } from '../app/layouts/admin-layouts/admin-layout/admin-layout.component';
import { UserLayoutComponent } from '../app/layouts/user-layouts/user-layout/user-layout.component';
import { EmptyLayoutComponent } from '@layouts/empty-layout/empty-layout.component';

export const routes: Routes = [
  { path: '', redirectTo: 'auth/login', pathMatch: 'full' },
  // {
  //   path: '',
  //   component: LayoutComponent,
  //   canActivate: [AuthGuard],
  //   loadChildren: () =>
  //     import('./views/views.route').then((mod) => mod.VIEW_ROUTES),
  // },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./auth/auth.route').then((mod) => mod.AUTH_ROUTES),
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' },
    loadChildren: () =>
      import('./modules/admin/admin.route').then((mod) => mod.ADMIN_ROUTES),
  },
  {
    path: 'user',
    component: UserLayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'user' },
    loadChildren: () =>
      import('./modules/user/user.route').then((mod) => mod.USER_ROUTES),
  },
  // =================================================================
  // 🔥 SADECE USER İÇİN TV / GENİŞ EKRAN MODU
  // =================================================================
  {
    path: 'tv',
    component: EmptyLayoutComponent, 
    canActivate: [AuthGuard], 
    children: [
      {
        // SADECE USER ROTASI VAR. Admin buraya erişemez (404 verir).
        path: 'user',
        data: { role: 'user' },
        loadChildren: () => import('./modules/user/user.route').then((mod) => mod.USER_ROUTES),
      }
    ]
  },
  // =================================================================
  {
    path: '404',
    loadChildren: () => 
      import('./modules/shared/error-404/error-404.route').then(m => m.ERROR_404_ROUTES)
  },
  // ----------------------------------

  // Wildcard her zaman EN SONDA olmalı (Doğru yapmışsın)
  { path: '**', redirectTo: '404' }
];
