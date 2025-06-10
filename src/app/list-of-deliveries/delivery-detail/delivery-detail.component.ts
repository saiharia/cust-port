import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';

@Component({
  selector: 'app-delivery-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './delivery-detail.component.html',
  styleUrls: ['./delivery-detail.component.scss']
})
export class DeliveryDetailComponent implements OnInit {
  deliveryData: any = null;
  loading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location
  ) {}

  ngOnInit(): void {
    // Get the delivery data from navigation state
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state?.['deliveryData']) {
      this.deliveryData = navigation.extras.state['deliveryData'];
      this.loading = false;
    } else {
      // If no data in state, redirect back to deliveries list
      this.router.navigate(['/list-of-deliveries']);
    }
  }

  goBack(): void {
    this.location.back();
  }

  getStatusClass(status: string): string {
    const statusMap: Record<string, string> = {
      'A': 'status-pending',
      'B': 'status-transit',
      'C': 'status-completed',
      '': 'status-unknown'
    };
    return statusMap[status] || statusMap[''];
  }

  getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'A': 'Pending',
      'B': 'In Transit',
      'C': 'Delivered',
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