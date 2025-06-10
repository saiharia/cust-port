import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-invoicelist',
  imports: [FormsModule, CommonModule],
  templateUrl: './invoicelist.component.html',
  styleUrl: './invoicelist.component.scss'
})
export class InvoicelistComponent {
INVOICE: any[] = [];
  searchText: string = '';
  key: string = ''; // column to sort
  reverse: boolean = false;
  customerId: string = '';

  headers = [
    "Document number", "Billing date", "Material Number", "Download"
  ];

  names = [
    "VBELN","FKDAT", "POSNR", "DOWNLOAD"
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.customerId = localStorage.getItem('customerId') || '';

    if (!this.customerId) {
      console.error('No customerId found in local storage');
      return;
    }

    this.http.post<any>('http://localhost:3000/invoicedata', { customerId: this.customerId }).subscribe(
      (data: any) => {
        this.INVOICE = data.invoice_data;
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
  return this.INVOICE
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
    this.INVOICE.filter(row => JSON.stringify(row).toLowerCase().includes(this.searchText?.toLowerCase() || '')).length / this.itemsPerPage
  );
}
downloadPDF(vbeln: string, posnr: string): void {
  const payload = {
    invoiceNumber: vbeln,
    itemnumber: posnr
  };

  this.http.post('http://localhost:3000/invoice', payload, { responseType: 'blob' }).subscribe(
    (blob: Blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `invoice_${vbeln}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);
    },
    error => {
      console.error('Error downloading PDF', error);
      alert('Failed to download invoice PDF.');
    }
  );
}

}
