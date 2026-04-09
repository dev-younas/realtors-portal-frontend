import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-seller-my-package',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, DecimalPipe],
  templateUrl: './my-package.html',
  styleUrls: ['./my-package.css']
})
export class MyPackage implements OnInit {
  private readonly API = 'http://localhost:5183/api';

  loading      = true;
  subscription: any = null;
  noSub        = false;

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  private h() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  load() {
    this.loading = true;
    this.http.get<any>(`${this.API}/Subscription/my-subscription`, { headers: this.h() }).subscribe({
      next: (d) => {
        this.subscription = d;
        this.noSub        = !d;
        this.loading      = false;
      },
      error: () => {
        // Mock subscription for display
        this.subscription = {
          packageName:    'Professional',
          description:    'For growing real estate agents.',
          price:          79,
          startDate:      '2026-02-01',
          endDate:        '2026-03-03',
          remainingAds:   18,
          maxAds:         25,
          maxImages:      50,
          maxImagesPerAd: 5,
          durationDays:   30,
          isActive:       true,
        };
        this.loading = false;
      }
    });
  }

  get daysLeft(): number {
    if (!this.subscription?.endDate) return 0;
    const end = new Date(this.subscription.endDate);
    const now = new Date();
    return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
  }

  get adsUsedPercent(): number {
    if (!this.subscription) return 0;
    const used = (this.subscription.maxAds - this.subscription.remainingAds);
    return Math.round((used / this.subscription.maxAds) * 100);
  }

  get daysPercent(): number {
    if (!this.subscription) return 0;
    return Math.round((this.daysLeft / this.subscription.durationDays) * 100);
  }
}
