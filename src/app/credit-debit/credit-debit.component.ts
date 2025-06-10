import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FilterPipe } from '../filter.pipe';
import { HttpClient, HttpParams } from '@angular/common/http';
import { CreditComponent } from "../credit/credit.component";

@Component({
  selector: 'app-credit-debit',
  imports: [CommonModule, FormsModule, CreditComponent],
  templateUrl: './credit-debit.component.html',
  styleUrl: './credit-debit.component.scss'
})
export class CreditDebitComponent {CREDIT: any[] = [];
  searchText: string = '';
  key: string = ''; // column to sort
  reverse: boolean = false;

  headers = [
   'Billing Document Number', 'Billing Type', 'Billing Category', 'Document Category',
    'Sales Organization', 'Sold-To Party', 'Document Currency', 'Pricing Procedure',
    'Document Condition Number', 'Billing Date', 'Exchange Rate', 'Net Value of the Billing Document',
    'Entry Time', 'Entry Date', 'Customer Purchase Order Number', 'Material Number',
    'Item Number of Billing Document', 'Sales Unit (Unit of Measure)'
  ];

  names = [
   'VBELN', 'FKART', 'FKTYP', 'VBTYP', 'VKORG', 'KUNAG', 'WAERK',
    'KALSM', 'KNUMV', 'FKDAT', 'KURRF', 'NETWR', 'ERZET',
    'ERDAT', 'BSTNK_VF', 'MATNR', 'POSNR', 'VRKME'
  ];
  customerId = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {

    this.customerId = localStorage.getItem('customerId') || '';

    if (!this.customerId) {
      console.error('No customerId found in local storage');
      return;
    }

    this.http.post<any>('http://localhost:3000/credit', { customerId: this.customerId }).subscribe(
      (data: any) => {
  this.CREDIT = data.credits;
},
      error => {
        console.error('Error fetching credit memo data', error);
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
itemsPerPage = 7;

get paginatedData() {
  const start = (this.currentPage - 1) * this.itemsPerPage;
  return this.CREDIT
    .filter(row => JSON.stringify(row).toLowerCase().includes(this.searchText?.toLowerCase() || ''))
    .sort((a, b) => {
      if (!this.key) return 0;
      return this.reverse
        ? (a[this.key] > b[this.key] ? -1 : 1)
        : (a[this.key] < b[this.key] ? -1 : 1);
    })
    .slice(start, start + this.itemsPerPage);
}
activeTable: 'credit' | 'debit' = 'credit';
showTable(table: 'credit' | 'debit') {
    this.activeTable = table;
  }

get totalPages() {
  return Math.ceil(
    this.CREDIT.filter(row => JSON.stringify(row).toLowerCase().includes(this.searchText?.toLowerCase() || '')).length / this.itemsPerPage
  );
}
}
