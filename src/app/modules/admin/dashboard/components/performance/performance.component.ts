import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import type { ChartOptions } from '@common/apexchart.model'; // Senin projendeki yol
import { NgApexchartsModule } from 'ng-apexcharts';

@Component({
  selector: 'dashboard-performance',
  standalone: true,
  imports: [NgApexchartsModule],
  templateUrl: './performance.component.html',
})
export class PerformanceComponent implements OnChanges {
  @Input() monthlyRevenue: { month: string; paidAmount: number; pendingAmount: number }[] = [];

  performanceChart: Partial<ChartOptions> = {
    chart: { height: 313, type: 'area', toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    colors: ['#22c55e', '#ff6c2f'], // Yeşil (Ödenen), Turuncu (Bekleyen)
    xaxis: { categories: [] },
    yaxis: { labels: { formatter: (val) => val.toFixed(0) } },
    grid: { borderColor: '#f1f1f1' },
    legend: { show: true, position: 'top' },
    series: []
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['monthlyRevenue'] && this.monthlyRevenue) {
      this.updateChart();
    }
  }

  updateChart() {
    const categories = this.monthlyRevenue.map(x => x.month);
    const paidData = this.monthlyRevenue.map(x => x.paidAmount);
    const pendingData = this.monthlyRevenue.map(x => x.pendingAmount);

    this.performanceChart = {
      ...this.performanceChart,
      xaxis: { ...this.performanceChart.xaxis, categories: categories },
      series: [
        { name: 'Tahsil Edilen', data: paidData },
        { name: 'Bekleyen', data: pendingData }
      ]
    };
  }
}