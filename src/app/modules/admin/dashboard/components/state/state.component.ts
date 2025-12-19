import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardStats } from '../../services/dashboard.service';

@Component({
  selector: 'dashboard-state',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './state.component.html',
})
export class StateComponent {
  @Input() stats!: DashboardStats;
}