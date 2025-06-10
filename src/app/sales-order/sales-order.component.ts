import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../filter.pipe';
import { HttpClient } from '@angular/common/http';
import { OrderByPipe } from "../order-by.pipe";

@Component({
  selector: 'app-sales-order',
  imports: [FormsModule, CommonModule],
  templateUrl: './sales-order.component.html',
  styleUrl: './sales-order.component.scss'
})
export class SalesOrderComponent {
  SALES: any[] = [];
  searchText: string = '';
  key: string = '';
  reverse: boolean = false;
  customerId = '';

  toggleSidebar() {
    document.body.classList.toggle('sidebar-open');
  }

  headers = [
     "Sales Document", "Sales Document Item","Record Creation Date", "Customer Reference", "Division", "Sales Document Type",
    "Overall Delivery Status", "Overall Processing Status", "Material Number","Material Name","Order Quantity",
    "Sales Unit", "Net Value", "Currency", "Requested Delivery Date"
  ];

  names = [
    "VBELN", "POSNR",
    "ERDAT", "BSTNK", "SPART", "AUART",
    "LFGSK", "GBSTK", "MATNR" ,"ARKTX","KWMENG",
    "VRKME", "NETWR", "WAERK", "VDATU"
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.customerId = localStorage.getItem('customerId') || '';

    if (!this.customerId) {
      console.error('No customerId found in local storage');
      return;
    }

    this.http.post<any>('http://localhost:3000/sales', { customerId: this.customerId }).subscribe(
      (data: any) => {
        this.SALES = data.sales;
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
  return this.SALES
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
    this.SALES.filter(row => JSON.stringify(row).toLowerCase().includes(this.searchText?.toLowerCase() || '')).length / this.itemsPerPage
  );
}


  
}
