import { Route } from '@angular/router'

import { SymbolCategoryListComponent } from './symbol-category-list/symbol-category-list.component'
import { SymbolCategoryAddComponent } from './symbol-category-add/symbol-category-add.component'
import { SymbolCategoryEditComponent } from './symbol-category-edit/symbol-category-edit.component'

export const SYMBOL_CATEGORY_ROUTES: Route[] = [
  {
    path: 'list',
    component: SymbolCategoryListComponent,
    data: { title: 'Sembol Kategori Listesi' },
  },
   {
    path: 'add',
    component: SymbolCategoryAddComponent,
    data: { title: 'Sembol Kategori Ekle' },
  },
  {
    path: 'edit/:id',
    component: SymbolCategoryEditComponent,
    data: { title: 'Sembol Kategori Düzenle' },
  },
]
