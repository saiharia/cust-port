import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgChartsModule } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { DataService } from '../services/data.service'; // ✅ Update path if needed

@Component({
  selector: 'app-overall', // ✅ Update selector
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, RouterLinkActive, NgChartsModule],
  templateUrl: './overall.component.html', // ✅ Your HTML file
  styleUrls: ['./overall.component.scss'] // ✅ Your SCSS file
})
export class OverallComponent implements OnInit {
    salesData: any[] = [];
  inquiryData: any[] = [];
  deliveryData: any[] = [];
  isLoading = true;
  error = '';
  dateRange = 'month';
  activeTab = 'summary';

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
    labels: ['biscuit', 'coffee', 'food', 'sandwich veg'],
    datasets: [{
      data: [],
      label: 'Inquiries',
      
      backgroundColor: ['#388e3c', '#f57c00', '#1a237e', '#4BC0C0'],
      fill: true
    }]
  };

  deliveryStatusData: ChartData = {
    labels: ['Completed', 'Pending', 'In Transit'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: ['#388e3c', '#f57c00', '#1a237e']
    }]
  };

  salesTrendData: ChartConfiguration['data'] = {
    labels: [],
    datasets: [{
      data: [],
      label: 'Sales Revenue',
      borderColor: '#1a237e',
      backgroundColor: 'rgba(26, 35, 126, 0.2)',
      fill: true
    }]
  };

  chartOptions: ChartConfiguration['options'] = {
    responsive: true,
    scales: { y: { beginAtZero: true } },
    plugins: { legend: { display: true } }
  };

  constructor(private dataService: DataService) {}

  ngOnInit(): void {
    this.loadAllData();
  }

  loadAllData(): void {
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
      this.error = 'Failed to load data. Please try again later.';
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
      (totalDelivered / totalOrdered) * 100 : 0;

    const onTime = this.deliveryData.filter(del => {
      const lfd = new Date(del.LFDAT);
      const rqd = new Date(del.VDATU);
      return lfd <= rqd;
    }).length;
    this.kpis.onTimeDeliveryRate = this.kpis.totalDeliveries ?
      (onTime / this.kpis.totalDeliveries) * 100 : 0;

    const revenueByCustomer = new Map<string, number>();
    this.salesData.forEach(order => {
      const val = revenueByCustomer.get(order.KUNNR) || 0;
      revenueByCustomer.set(order.KUNNR, val + (parseFloat(order.NETWR) || 0));
    });
    this.kpis.topCustomer = Array.from(revenueByCustomer.entries())
      .sort(([, a], [, b]) => b - a)[0]?.[0] || '';

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
      pending: 0,
      inTransit: 0
    };

    this.deliveryData.forEach(delivery => {
      switch (delivery.GBSTK) {
        case 'C': statusCounts.completed++; break;
        case 'B': statusCounts.pending++; break;
        case 'A': statusCounts.inTransit++; break;
        default: statusCounts.inTransit++; break;
      }
    });

    this.deliveryStatusData.datasets[0].data = [
      statusCounts.completed,
      statusCounts.pending,
      statusCounts.inTransit
    ];
  }

  updateSalesTrend(): void {
    const dailyMap = new Map<string, { total: number, count: number }>();

    for (const sale of this.salesData) {
      const date = new Date(sale.ERDAT).toISOString().split('T')[0];
      const revenue = parseFloat(sale.NETWR) || 0;

      const entry = dailyMap.get(date) || { total: 0, count: 0 };
      entry.total += revenue;
      entry.count += 1;
      dailyMap.set(date, entry);
    }

    const sortedDates = Array.from(dailyMap.keys()).sort();
    const labels = sortedDates;
    const data = sortedDates.map(date => {
      const { total, count } = dailyMap.get(date)!;
      return total / count;
    });

    this.salesTrendData.labels = labels;
    this.salesTrendData.datasets[0].data = data;
  }

  setDateRange(range: string): void {
    this.dateRange = range;
    this.updateCharts();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  getTopProducts(): any[] {
    const productMap = new Map<string, { units: number, revenue: number }>();
    this.salesData.forEach(o => {
      const key = o.MATNR;
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
}
