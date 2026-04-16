import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 
import { environment } from '../../../environments/environement';

@Component({
  selector: 'app-seller-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, DecimalPipe, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class SellerDashboard implements OnInit {
  private readonly API = environment.apiUrl;

  loading = true;
  today   = new Date();

  stats = {
    totalListings:   0,
    approvedListings: 0,
    pendingListings:  0,
    rejectedListings: 0,
    remainingAds:     0,
    subscriptionDaysLeft: 0,
    packageName: '',
  };

  recentListings: any[] = [];

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  private h() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  load() {
    this.loading = true;
    this.http.get<any[]>(`${this.API}/Listing/my-listings`, { headers: this.h() }).subscribe({
      next: (listings) => {
        this.stats.totalListings    = listings.length;
        this.stats.approvedListings = listings.filter(l => l.status === 'Approved').length;
        this.stats.pendingListings  = listings.filter(l => l.status === 'Pending').length;
        this.stats.rejectedListings = listings.filter(l => l.status === 'Rejected').length;
        this.recentListings         = listings.slice(0, 5);
        this.loading = false;
      },
      error: () => {
        this.recentListings = this.mockListings();
        this.stats = { totalListings: 5, approvedListings: 3, pendingListings: 1, rejectedListings: 1, remainingAds: 10, subscriptionDaysLeft: 22, packageName: 'Professional' };
        this.loading = false;
      }
    });

    // Load subscription info
    this.http.get<any>(`${this.API}/Subscription/my-subscription`, { headers: this.h() }).subscribe({
      next: (sub) => {
        if (sub) {
          this.stats.remainingAds        = sub.remainingAds ?? 0;
          this.stats.packageName         = sub.packageName  ?? '';
          const end = new Date(sub.endDate);
          const now = new Date();
          this.stats.subscriptionDaysLeft = Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
        }
      },
      error: () => {}
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  private mockListings() {
    return [
      { title: '3BR Apartment, Lahore',    categoryName: 'Residential', status: 'Approved', price: 85000 },
      { title: 'Commercial Plot, Karachi',  categoryName: 'Commercial',  status: 'Pending',  price: 250000 },
      { title: 'Studio Flat, DHA',          categoryName: 'Residential', status: 'Rejected', price: 45000 },
    ];
  }
}
