import { Route } from '@angular/router'
import { SubscriptionListComponent } from './subscription-list/subscription-list.component'
import { SubscriptionAddComponent } from './subscription-add/subscription-add.component'
import { SubscriptionEditComponent } from './subscription-edit/subscription-edit.component'


export const SUBSCRIPTION_ROUTES: Route[] = [
  { path: '', redirectTo: 'list', pathMatch: 'full' }, // /admin/customers yazılırsa listeye at
  {
    path: 'list',
    component: SubscriptionListComponent,
    data: { title: 'Abonelik Listesi' },
  },
  {
    path: 'add',
    component: SubscriptionAddComponent ,
    data: { title: 'Abonelik Ekle' },
  },
  {
    path: 'edit/:id',
    component: SubscriptionEditComponent ,
    data: { title: 'Abonelik Düzenle' },
  }
]