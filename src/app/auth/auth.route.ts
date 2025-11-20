import { Route } from '@angular/router';
import { LoginComponent } from './login/login.component';

import { ResetPasswordComponent } from './reset-password/reset-password.component';

export const AUTH_ROUTES: Route[] = [
  {
    path: 'login',
    component: LoginComponent,
    data: { title: 'Giriş Yap' },
  },
  {
    path: 'password',
    component: ResetPasswordComponent,
    data: { title: 'Şifreyi Sıfırla' },
  },
  
];
