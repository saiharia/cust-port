import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-sales-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './sales-detail.component.html',
  styleUrls: ['./sales-detail.component.scss']
})
export class SalesDetailComponent implements OnInit {
  salesData: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Get the sales data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['salesData']) {
      this.salesData = navigation.extras.state['salesData'];
      this.loading = false;
    } else {
      // If no data in state, redirect back to sales order list
      this.router.navigate(['/sales-order']);
    }
  }

  goBack(): void {
    this.location.back();
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'A': 'status-pending',
      'B': 'status-inprogress',
      'C': 'status-completed',
      '': 'status-unknown'
    };
    return statusMap[status] || statusMap[''];
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'A': 'Pending',
      'B': 'In Progress',
      'C': 'Completed',
      '': 'Unknown'
    };
    return statusMap[status] || statusMap[''];
  }

  getDeliveryStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'A': 'Not Delivered',
      'B': 'Partially Delivered',
      'C': 'Fully Delivered',
      '': 'Unknown'
    };
    return statusMap[status] || statusMap[''];
  }

  formatDate(dateString: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  }

  formatCurrency(value: any, currency: string = 'USD'): string {
    if (!value || isNaN(Number(value))) return 'N/A';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(Number(value));
  }

  formatNumber(value: any): string {
    if (!value || isNaN(Number(value))) return 'N/A';
    return new Intl.NumberFormat('en-US').format(Number(value));
  }
}