import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-statistics',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './statistics.html',
  styleUrls: ['./statistics.css','../../style.css']
})
export class Statistics implements OnInit {
  private readonly API = 'http://realtors.somee.com/api';

  period = '30';

  kpis = [
    { icon: '💰', label: 'Total Revenue', value: '$48,320', trend: 15.2 },
    { icon: '👥', label: 'New Users', value: '234', trend: 8.7 },
    { icon: '🏠', label: 'New Listings', value: '89', trend: -3.4 },
    { icon: '💳', label: 'Subscriptions', value: '312', trend: 11.0 },
  ];

  revenueData: { label: string; value: number; pct: number }[] = [];

  listingStats = { total: 389, approved: 278, pending: 72, rejected: 39 };

  get circumference() { return 2 * Math.PI * 70; }
  get approvedArc()  { return (this.listingStats.approved / this.listingStats.total) * this.circumference; }
  get pendingArc()   { return (this.listingStats.pending / this.listingStats.total) * this.circumference; }

  subscriptionBreakdown = [
    { name: 'Starter',      count: 145, revenue: 4205,  pct: 46 },
    { name: 'Professional', count: 134, revenue: 10586, pct: 43 },
    { name: 'Enterprise',   count: 33,  revenue: 6567,  pct: 11 },
  ];

  topAgents = [
    { name: 'Priya Sharma',    plan: 'Enterprise', listings: 31, approved: 29, revenue: 1240000, score: 96 },
    { name: 'Sarah Mitchell',  plan: 'Professional', listings: 14, approved: 13, revenue: 680000,  score: 88 },
    { name: 'Marco Rivera',    plan: 'Professional', listings: 12, approved: 10, revenue: 520000,  score: 82 },
    { name: 'Linda Chen',      plan: 'Professional', listings: 5,  approved: 4,  revenue: 390000,  score: 75 },
    { name: 'Aisha Okonkwo',   plan: 'Starter',      listings: 5,  approved: 3,  revenue: 180000,  score: 64 },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadStats(); }

  private getHeaders() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  loadStats(): void {
    // GET /api/Admin/dashboard-stats
    this.http.get<any>(`${this.API}/Admin/dashboard-stats`, { headers: this.getHeaders() }).subscribe({
      next: (data) => { this.processStats(data); },
      error: () => { this.buildMockRevenueChart(); }
    });
  }

  processStats(data: any): void {
    // Map real data here when endpoint returns it
    this.buildMockRevenueChart();
  }

  buildMockRevenueChart(): void {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const values = [3200, 4100, 3800, 5200, 6100, 5800, 7200, 8100, 7600, 9200, 8800, 9800];
    const max = Math.max(...values);
    this.revenueData = months.slice(0, 12).map((label, i) => ({
      label,
      value: values[i],
      pct: Math.round((values[i] / max) * 100)
    }));
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
