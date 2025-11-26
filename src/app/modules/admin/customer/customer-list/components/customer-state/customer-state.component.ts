import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { currency } from '@common/constants'; 

@Component({
  selector: 'app-admin-customer-state',
  standalone: true,
  imports: [],
  templateUrl: './customer-state.component.html',
  styleUrl: './customer-state.component.scss',
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
  
})
export class CustomerStateComponent {
  currency = currency;
}
