import { Route } from '@angular/router'
import { RoleListComponent } from './role-list/role-list.component'
import { RoleEditComponent } from './role-edit/role-edit.component'
import { RoleAddComponent } from './role-add/role-add.component'

export const ROLE_ROUTES: Route[] = [
  {
    path: 'list',
    component: RoleListComponent,
    data: { title: 'Role Listesi' },
  },
  {
    path: 'edit/:id',
    component: RoleEditComponent,
    data: { title: 'Rol Düzenle' },
  },
  {
    path: 'add',
    component: RoleAddComponent,
    data: { title: 'Rol Ekle' },
  }
]
