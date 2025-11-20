import { Routes } from '@angular/router';
import { LayoutComponent } from './layouts/layout/layout.component';
import { AuthLayoutComponent } from '@layouts/auth-layout/auth-layout.component';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'index', pathMatch: 'full' },
  {
    path: '',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    loadChildren: () =>
      import('./views/views.route').then((mod) => mod.VIEW_ROUTES),
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    loadChildren: () =>
      import('./auth/auth.route').then((mod) => mod.AUTH_ROUTES),
  },
  {
    path: 'admin',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'admin' },
    loadChildren: () =>
      import('./modules/admin/dashboard/admin.route').then((mod) => mod.ADMIN_ROUTES),
  },
  {
    path: 'user',
    component: LayoutComponent,
    canActivate: [AuthGuard],
    data: { role: 'user' },
    loadChildren: () =>
      import('./modules/user/dashboard/user.route').then((mod) => mod.USER_ROUTES),
  },
];
