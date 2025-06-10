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

  toggleSidebar() {
    document.body.classList.toggle('sidebar-open');
  }

  headers = [
     "Billing Number", "Billing Date","	Due Date ", "Aging", "Payment status", "	Division",
    "	Net Value", "	Currency", "	Payment Terms","	Sales Organization",
    "	Distribution Channel"
  ];

  names = [
    "VBELN", "FKDAT",
    "DUE_DATE", "AGING", "PAYMENT_STATUS", "SPART",
    "NETWR", "WAERK", "ZTERM" ,"VKORG",
    "VTWEG"
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
        this.PAYAGE = data.payage;
      },
      error => {
        console.error('Error fetching sales data', error);
      }
    );
  }

  sort(key: string): void {
    if (this.key === key) {
      this.reverse = !this.reverse;
    } else {
      this.key = key;
      this.reverse = false;
    }
  }
    currentPage = 1;
itemsPerPage = 5;

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
