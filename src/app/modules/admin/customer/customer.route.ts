import { Route } from '@angular/router'
import { CustomerListComponent } from './customer-list/customer-list.component'
import { CustomerDetailComponent } from './customer-detail/customer-detail.component'
import { CustomerAddComponent } from './customer-add/customer-add.component'
import { CustomerEditComponent } from './customer-edit/customer-edit.component'

export const CUSTOMERS_ROUTES: Route[] = [
  { path: '', redirectTo: 'list', pathMatch: 'full' }, // /admin/customers yazılırsa listeye at
  {
    path: 'list',
    component: CustomerListComponent,
    data: { title: 'Müşteri Listesi' },
  },
  {
    path: 'add',
    component: CustomerAddComponent ,
    data: { title: 'Müşteri Ekle' },
  },
  {
    path: 'edit/:id',
    component: CustomerEditComponent   ,
    data: { title: 'Müşteri Düzenle' },
  },
  {
    path: 'detail/:id', // Eğer ID ile çalışacaksan: path: 'detail/:id'
    component: CustomerDetailComponent,
    data: { title: 'Müşteri Detay' },
  }
]