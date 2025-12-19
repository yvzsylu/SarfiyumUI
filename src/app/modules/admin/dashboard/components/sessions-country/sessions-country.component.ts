import { Component, Input, OnChanges } from '@angular/core';
import type { ChartOptions } from '@common/apexchart.model';
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'dashboard-sessions-country',
  standalone: true,
  imports: [NgApexchartsModule], // Map yerine Chart kullanıyoruz
  templateUrl: './sessions-country.component.html',
})
export class SessionsCountryComponent implements OnChanges {
  @Input() monthly: number = 0;
  @Input() yearly: number = 0;

  chartOptions: Partial<ChartOptions> = {
    chart: { type: 'pie', height: 280 },
    labels: ['Aylık Plan', 'Yıllık Plan'],
    colors: ['#3b82f6', '#f59e0b'],
    legend: { position: 'bottom' },
    series: [0, 0]
  };

  ngOnChanges() {
    this.chartOptions = {
        ...this.chartOptions,
        series: [this.monthly, this.yearly]
    };
  }
}