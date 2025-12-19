import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'dashboard-recent-order',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './recent-order.component.html',
})
export class RecentOrderComponent {
  @Input() unpaidList: { tenantId: string; tenantName: string; planName: string; amount: number; dueDate: string }[] = [];
}