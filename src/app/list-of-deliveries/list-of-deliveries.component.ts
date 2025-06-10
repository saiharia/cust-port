import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../filter.pipe';
import { HttpClient } from '@angular/common/http';
import { OrderByPipe } from "../order-by.pipe";

@Component({
  selector: 'app-list-of-deliveries',
  imports: [FormsModule, CommonModule],
  templateUrl: './list-of-deliveries.component.html',
  styleUrl: './list-of-deliveries.component.scss'
})
export class ListOfDeliveriesComponent {
DELIVERIES: any[] = [];
  searchText: string = '';
  key: string = ''; // column to sort
  reverse: boolean = false;
  customerId: string = '';

  headers = [
    "Delivery", "Delivery Item", "Material Number", "Material Name", "Delivery Type", "Sales Unit", "Net Value", "Currency",
    "Delivery Date", "Processing Status", "Plant",
    "Storage Location", "Shipping Point"
  ];

  names = [
    "VBELN", "POSNR", "MATNR","ARKTX", "LFART",
     "VRKME", "NETWR", "WAERK",
    "LFDAT", "GBSTK", "WERKS", "LGORT", "VSTEL"
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.customerId = localStorage.getItem('customerId') || '';

    if (!this.customerId) {
      console.error('No customerId found in local storage');
      return;
    }

    this.http.post<any>('http://localhost:3000/deliveries', { customerId: this.customerId }).subscribe(
      (data: any) => {
        this.DELIVERIES = data.deliveries;
      },
      error => {
        console.error('Error fetching delivery data', error);
      }
    );
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

  toggleSidebar() {
    document.body.classList.toggle('sidebar-open');
  }
  currentPage = 1;
itemsPerPage = 5;

get paginatedData() {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  return this.DELIVERIES
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
    this.DELIVERIES.filter(row => JSON.stringify(row).toLowerCase().includes(this.searchText?.toLowerCase() || '')).length / this.itemsPerPage
  );
}


}
