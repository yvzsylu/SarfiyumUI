import { Route } from '@angular/router'
import { SymbolListComponent } from './symbol-list/symbol-list.component'
import { SymbolAddComponent } from './symbol-add/symbol-add.component'
import { SymbolEditComponent } from './symbol-edit/symbol-edit.component'

export const SYMBOL_ROUTES: Route[] = [
  {
    path: 'list',
    component: SymbolListComponent,
    data: { title: 'Sembol Listesi' },
  },
   {
    path: 'add',
    component: SymbolAddComponent,
    data: { title: 'Sembol Ekle' },
  },
  {
    path: 'edit/:id',
    component: SymbolEditComponent,
    data: { title: 'Sembol Düzenle' },
  },
]
