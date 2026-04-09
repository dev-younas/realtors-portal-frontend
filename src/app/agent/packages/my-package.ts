import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterModule }      from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-agent-my-package',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe],
  templateUrl: './my-package.html',
  styleUrls: ['./packages.css']
})
export class AgentMyPackage implements OnInit {
  private readonly API = 'http://realtors.somee.com/api';

  loading      = true;
  subscription: any = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadMySubscription(); }

  private h() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  // GET /api/Subscription/my-subscription
  loadMySubscription(): void {
    this.loading = true;

    this.http.get<any>(`${this.API}/Subscription/my-subscription`, { headers: this.h() }).subscribe({
      next: (data) => {
        this.subscription = data;
        this.loading = false;
      },
      error: () => {
        this.subscription = null;
        this.loading = false;
      }
    });
  }

  get daysLeft(): number {
    if (!this.subscription?.endDate) return 0;
    const diff = new Date(this.subscription.endDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  get isExpiringSoon(): boolean { return this.daysLeft > 0 && this.daysLeft <= 7; }
}