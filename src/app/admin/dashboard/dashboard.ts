import { Component, OnInit }            from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule }                   from '@angular/router';
import { HttpClient, HttpHeaders }        from '@angular/common/http';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, DecimalPipe],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css','../style.css']
})
export class Dashboard implements OnInit {
  private readonly API = 'http://localhost:5183/api';

  loading = true;
  today   = new Date();

  stats = {
    totalListings:    0,
    totalAgents:      0,
    totalSellers:     0,
    pendingApprovals: 0,
    pendingAgents:    0,
    pendingListings:  0,
    totalRevenue:     0,
  };

  recentListings: any[] = [];
  recentAgents:   any[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadDashboard(); }

  private getHeaders() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  loadDashboard(): void {
    // GET /api/Admin/dashboard-stats
    this.http.get<any>(`${this.API}/Admin/dashboard-stats`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        this.stats          = { ...this.stats, ...data };
        this.recentListings = data.recentListings ?? this.mockListings();
        this.recentAgents   = data.recentAgents   ?? this.mockAgents();
        this.loading        = false;
      },
      error: () => {
        this.stats          = this.mockStats();
        this.recentListings = this.mockListings();
        this.recentAgents   = this.mockAgents();
        this.loading        = false;
      }
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  private mockStats() {
    return { totalListings: 389, totalAgents: 124, totalSellers: 87, pendingApprovals: 14, pendingAgents: 5, pendingListings: 9, totalRevenue: 48320 };
  }

  private mockListings() {
    return [
      { title: '3BR Apartment, Lahore', agent: 'Sarah M.', status: 'Approved', date: '2024-06-01' },
      { title: 'Commercial Plot, Karachi', agent: 'James C.', status: 'Pending', date: '2024-06-02' },
      { title: 'Villa, Islamabad', agent: 'Priya S.', status: 'Approved', date: '2024-05-30' },
      { title: 'Studio Flat, DHA', agent: 'Tom B.', status: 'Rejected', date: '2024-05-29' },
    ];
  }

  private mockAgents() {
    return [
      { name: 'Sarah Mitchell', email: 'sarah@realty.com', status: 'Approved', date: '2024-06-01' },
      { name: 'James Carter',   email: 'james@homes.net',  status: 'Pending',  date: '2024-06-02' },
      { name: 'Priya Sharma',   email: 'priya@luxury.co',  status: 'Approved', date: '2024-05-28' },
    ];
  }
}
