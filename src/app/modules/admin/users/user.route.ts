import { Route } from '@angular/router'
import { UserListComponent } from './user-list/user-list.component'
import { UserAddComponent } from './user-add/user-add.component'
import { UserEditComponent } from './user-edit/user-edit.component'

export const USER_ROUTES: Route[] = [
  {
    path: 'list',
    component: UserListComponent,
    data: { title: 'Kullanıcı Listesi' },
  },
   {
    path: 'add',
    component: UserAddComponent,
    data: { title: 'Kullanıcı Ekle' },
  },
  {
    path: 'edit/:id',
    component: UserEditComponent,
    data: { title: 'Kullanıcı Düzenle' },
  },
]
