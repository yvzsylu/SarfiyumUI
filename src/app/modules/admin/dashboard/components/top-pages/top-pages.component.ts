import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dashboard-top-pages',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './top-pages.component.html',
})
export class TopPagesComponent {
  @Input() tenants: { tenantName: string; endDate: string; remainingDays: number }[] = [];
}