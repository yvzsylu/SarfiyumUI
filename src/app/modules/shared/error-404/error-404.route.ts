import { Route } from '@angular/router'

import { Error404Component } from './error-404.component'


export const ERROR_404_ROUTES: Route[] = [
  {
    path: '',
    component: Error404Component,
    data: { title: 'Sayfa Bulunamadı - 404' },
  }
]
