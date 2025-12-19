import { Component, Input, OnChanges } from '@angular/core';
import type { ChartOptions } from '@common/apexchart.model';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'dashboard-conversions',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './conversions.component.html',
})
export class ConversionsComponent implements OnChanges {
  @Input() active: number = 0;
  @Input() expired: number = 0;

  chartOptions: Partial<ChartOptions> = {
    chart: { type: 'donut', height: 280 },
    labels: ['Aktif', 'Süresi Dolmuş'],
    colors: ['#22c55e', '#ef4444'],
    legend: { position: 'bottom' },
    dataLabels: { enabled: false },
    series: [0, 0]
  };

  ngOnChanges() {
    this.chartOptions = {
        ...this.chartOptions,
        series: [this.active, this.expired]
    };
  }
}