import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-payage',
  imports: [FormsModule, CommonModule],
  templateUrl: './payage.component.html',
  styleUrl: './payage.component.scss'
})
export class PayageComponent {
  PAYAGE: any[] = [];
  searchText: string = '';
  key: string = '';
  reverse: boolean = false;
  customerId = '';

  headers = [
    "Billing Number", "Billing Date", "Due Date", "Aging", "Payment Status", "Division",
    "Net Value", "Currency", "Payment Terms", "Sales Organization", "Distribution Channel"
  ];

  names = [
    "VBELN", "FKDAT", "DUE_DATE", "AGING", "PAYMENT_STATUS", "SPART",
    "NETWR", "WAERK", "ZTERM", "VKORG", "VTWEG"
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.customerId = localStorage.getItem('customerId') || '';

    if (!this.customerId) {
      console.error('No customerId found in local storage');
      return;
    }

    this.http.post<any>('http://localhost:3000/payage', { customerId: this.customerId }).subscribe(
      (data: any) => {
        this.PAYAGE = data.payage || [];
      },
      error => {
        console.error('Error fetching payment data', error);
      }
    );
  }

  getThisMonthCount(): number {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    return this.PAYAGE.filter(item => {
      const itemDate = new Date(item.FKDAT);
      return itemDate.getMonth() === currentMonth && itemDate.getFullYear() === currentYear;
    }).length;
  }

  getAgingCount(): number {
    return this.PAYAGE.filter(item => {
      const aging = parseInt(item.AGING) || 0;
      return aging > 30; // Items older than 30 days
    }).length;
  }

  getTotalValue(): number {
    return this.PAYAGE.reduce((sum, item) => sum + (parseFloat(item.NETWR) || 0), 0);
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'PAID': 'status-paid',
      'PENDING': 'status-pending',
      'OVERDUE': 'status-overdue'
    };
    return statusMap[status?.toUpperCase()] || 'status-pending';
  }

  sort(key: string): void {
    this.currentPage = 1;
    if (this.key === key) {
      this.reverse = !this.reverse;
    } else {
      this.key = key;
      this.reverse = false;
    }
  }

  currentPage = 1;
  itemsPerPage = 7;

  get paginatedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.PAYAGE
      .filter(row => JSON.stringify(row).toLowerCase().includes(this.searchText?.toLowerCase() || ''))
      .sort((a, b) => {
        if (!this.key) return 0;
        return this.reverse
          ? (a[this.key] > b[this.key] ? -1 : 1)
          : (a[this.key] < b[this.key] ? -1 : 1);
      })
      .slice(start, start + this.itemsPerPage);
  }

  get totalPages() {
    return Math.ceil(
      this.PAYAGE.filter(row => JSON.stringify(row).toLowerCase().includes(this.searchText?.toLowerCase() || '')).length / this.itemsPerPage
    );
  }
}