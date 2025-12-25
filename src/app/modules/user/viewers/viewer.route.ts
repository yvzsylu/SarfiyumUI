import { Route } from '@angular/router'
import { ViewerListComponent } from './viewer-list/viewer-list.component'
import { ViewerAddComponent } from './viewer-add/viewer-add.component'
import { ViewerEditComponent } from './viewer-edit/viewer-edit.component'

export const VIEWER_ROUTES: Route[] = [
  {
    path: 'list',
    component: ViewerListComponent,
    data: { title: 'Kullanıcı Listesi' },
  },
   {
    path: 'add',
    component: ViewerAddComponent,
    data: { title: 'Kullanıcı Ekle' },
  },
  {
    path: 'edit/:id',
    component: ViewerEditComponent,
    data: { title: 'Kullanıcı Düzenle' },
  },
]
