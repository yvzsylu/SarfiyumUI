import { Route } from '@angular/router'

import { PrivacyPolicyComponent } from './privacy-policy.component'


export const PRIVACY_POLICY_ROUTES: Route[] = [
  {
    path: '',
    component: PrivacyPolicyComponent,
    data: { title: 'Gizlilik Politikası' },
  }
]
