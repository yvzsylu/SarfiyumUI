import { Component } from '@angular/core';
import { DetailComponent } from './components/detail/detail.component'
import { LatestInvoiceComponent } from './components/latest-invoice/latest-invoice.component'
import { DetailStateComponent } from './components/detail-state/detail-state.component'
import { TransactionHistoryComponent } from './components/transaction-history/transaction-history.component'
import { EarnPointComponent } from './components/earn-point/earn-point.component'
import { AccountChartComponent } from './components/account-chart/account-chart.component'

@Component({
  selector: 'app-customer-detail',
  imports: [DetailComponent,LatestInvoiceComponent,DetailStateComponent,TransactionHistoryComponent,EarnPointComponent,AccountChartComponent],
  templateUrl: './customer-detail.component.html',
  styleUrl: './customer-detail.component.scss'
})
export class CustomerDetailComponent {
  title = 'Customer Details';
}
