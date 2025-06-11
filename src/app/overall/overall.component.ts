import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DataService } from '../services/data.service';

@Component({
  selector: 'app-overall',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, NgChartsModule],
  templateUrl: './overall.component.html',
  styleUrls: ['./overall.component.scss']
})
export class OverallComponent implements OnInit {
  salesData: any[] = [];
  inquiryData: any[] = [];
  deliveryData: any[] = [];
  isLoading = true;
  error = '';
  dateRange = 'month';

  dateRanges = [
    { value: 'week', label: 'Last 7 Days' },
    { value: 'month', label: 'Last 30 Days' },
    { value: 'quarter', label: 'Last 3 Months' },
    { value: 'year', label: 'Last Year' }
  ];

  kpis = {
    totalInquiries: 0,
    totalOrders: 0,
    totalDeliveries: 0,
    totalRevenue: 0,
    deliveryFulfillmentRate: 0,
    onTimeDeliveryRate: 0,
    avgOrderValue: 0,
    topCustomer: '',
    pendingDeliveries: 0
  };

  // Chart Configurations
  inquiryTrendData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      backgroundColor: [
        '#0078d4', '#00bcf2', '#00b294', '#ffb900', 
        '#ff8c00', '#d13438', '#8764b8', '#605e5c'
      ],
      borderWidth: 0,
      hoverBorderWidth: 2,
      hoverBorderColor: '#ffffff'
    }]
  };

  deliveryStatusData: ChartData = {
    labels: ['Completed', 'In Transit', 'Pending'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#00b294', '#ffb900', '#d13438'],
      borderWidth: 0,
      hoverBorderWidth: 2,
      hoverBorderColor: '#ffffff'
    }]
  };

  salesTrendData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Revenue',
      borderColor: '#0078d4',
      backgroundColor: 'rgba(0, 120, 212, 0.1)',
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#0078d4',
      pointBorderColor: '#ffffff',
      pointBorderWidth: 2,
      pointRadius: 6,
      pointHoverRadius: 8
    }]
  };

  pieChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8,
        displayColors: true
      }
    }
  };

  lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: true,
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: { font: { size: 11 } }
      },
      x: {
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        ticks: { font: { size: 11 } }
      }
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8
      }
    }
  };

  doughnutChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    cutout: '60%',
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        cornerRadius: 8
      }
    }
  };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
    this.isLoading = true;
    this.error = '';
    
    const customerId = localStorage.getItem('customerId');

    if (!customerId) {
      this.error = 'Customer ID not found. Please log in again.';
      this.isLoading = false;
      return;
    }

    Promise.all([
      this.dataService.getSalesOrderData(customerId).toPromise(),
      this.dataService.getInquiryData(customerId).toPromise(),
      this.dataService.getDeliveryData(customerId).toPromise()
    ]).then(([salesData, inquiryData, deliveryData]) => {
      this.salesData = salesData?.sales || [];
      this.inquiryData = inquiryData?.inquiries || [];
      this.deliveryData = deliveryData?.deliveries || [];

      this.calculateKPIs();
      this.updateCharts();
      this.isLoading = false;
    }).catch(error => {
      this.error = 'Failed to load analytics data. Please try again.';
      console.error('Error loading data:', error);
      this.isLoading = false;
    });
  }

  calculateKPIs(): void {
    this.kpis.totalInquiries = this.inquiryData.length;
    this.kpis.totalOrders = this.salesData.length;
    this.kpis.totalDeliveries = this.deliveryData.length;

    this.kpis.totalRevenue = this.salesData.reduce((sum, order) =>
      sum + (parseFloat(order.NETWR) || 0), 0);

    this.kpis.avgOrderValue = this.kpis.totalOrders ?
      this.kpis.totalRevenue / this.kpis.totalOrders : 0;

    const totalOrdered = this.salesData.reduce((sum, o) =>
      sum + (parseFloat(o.KWMENG) || 0), 0);
    const totalDelivered = this.deliveryData.reduce((sum, d) =>
      sum + (parseFloat(d.LFIMG) || 0), 0);

    this.kpis.deliveryFulfillmentRate = totalOrdered ?
      Math.min((totalDelivered / totalOrdered) * 100, 100) : 0;

    const onTime = this.deliveryData.filter(del => {
      const lfd = new Date(del.LFDAT);
      const rqd = new Date(del.VDATU);
      return lfd <= rqd;
    }).length;
    this.kpis.onTimeDeliveryRate = this.kpis.totalDeliveries ?
      (onTime / this.kpis.totalDeliveries) * 100 : 0;

    this.kpis.pendingDeliveries = this.deliveryData.filter(del =>
      del.GBSTK !== 'C').length;
  }

  updateCharts(): void {
    this.updateInquiryPieChart();
    this.updateDeliveryStatus();
    this.updateSalesTrend();
  }

  updateInquiryPieChart(): void {
    const materialCount = new Map<string, number>();
    this.inquiryData.forEach(inquiry => {
      const material = inquiry.ARKTX || 'Unknown';
      materialCount.set(material, (materialCount.get(material) || 0) + 1);
    });

    const labels: string[] = [];
    const data: number[] = [];

    materialCount.forEach((count, material) => {
      labels.push(material);
      data.push(count);
    });

    this.inquiryTrendData.labels = labels;
    this.inquiryTrendData.datasets[0].data = data;
  }

  updateDeliveryStatus(): void {
    const statusCounts = {
      completed: 0,
      inTransit: 0,
      pending: 0
    };

    this.deliveryData.forEach(delivery => {
      switch (delivery.GBSTK) {
        case 'C': statusCounts.completed++; break;
        case 'B': statusCounts.inTransit++; break;
        case 'A': statusCounts.pending++; break;
        default: statusCounts.pending++; break;
      }
    });

    this.deliveryStatusData.datasets[0].data = [
      statusCounts.completed,
      statusCounts.inTransit,
      statusCounts.pending
    ];
  }

  updateSalesTrend(): void {
    const dailyMap = new Map<string, number>();

    this.salesData.forEach(sale => {
      const date = new Date(sale.ERDAT).toISOString().split('T')[0];
      const revenue = parseFloat(sale.NETWR) || 0;
      dailyMap.set(date, (dailyMap.get(date) || 0) + revenue);
    });

    const sortedDates = Array.from(dailyMap.keys()).sort().slice(-7); // Last 7 days
    const labels = sortedDates.map(date => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
    const data = sortedDates.map(date => dailyMap.get(date) || 0);

    this.salesTrendData.labels = labels;
    this.salesTrendData.datasets[0].data = data;
  }

  setDateRange(range: string): void {
    this.dateRange = range;
    this.updateCharts();
  }

  getTopProducts(): any[] {
    const productMap = new Map<string, { units: number, revenue: number }>();
    this.salesData.forEach(o => {
      const key = o.MATNR || 'Unknown';
      const current = productMap.get(key) || { units: 0, revenue: 0 };
      productMap.set(key, {
        units: current.units + (parseFloat(o.KWMENG) || 0),
        revenue: current.revenue + (parseFloat(o.NETWR) || 0)
      });
    });

    return Array.from(productMap.entries())
      .map(([product, data]) => ({ product, ...data }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }

  exportKPIs(): void {
    const kpiData = {
      'Total Inquiries': this.kpis.totalInquiries,
      'Total Orders': this.kpis.totalOrders,
      'Total Deliveries': this.kpis.totalDeliveries,
      'Total Revenue': this.kpis.totalRevenue,
      'Delivery Fulfillment Rate': `${this.kpis.deliveryFulfillmentRate.toFixed(1)}%`,
      'On-Time Delivery Rate': `${this.kpis.onTimeDeliveryRate.toFixed(1)}%`,
      'Average Order Value': this.kpis.avgOrderValue,
      'Pending Deliveries': this.kpis.pendingDeliveries
    };

    const csvContent = Object.entries(kpiData)
      .map(([key, value]) => `"${key}","${value}"`)
      .join('\n');

    const blob = new Blob([`Metric,Value\n${csvContent}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `kpi_report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }
}