import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { RouterModule }      from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environement';

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-agent-packages-plans',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './packages-plans.html',
  styleUrls: ['./packages.css']
})
export class AgentPackagesPlans implements OnInit {
  private readonly API = environment.apiUrl;

  packages:         any[] = [];
  loading           = true;
  buying:           number | null = null;
  currentPackageId: number | null = null;
  toasts: Toast[] = [];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadPackages(); }

  private h() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  // GET /api/Subscription/packages
  loadPackages(): void {
    this.loading = true;
    this.http.get<any[]>(`${this.API}/Subscription/packages`, { headers: this.h() }).subscribe({
      next: (data) => {
        this.packages = data.filter(p => p.isActive);
        this.loading  = false;
        const saved = localStorage.getItem('currentPackageId');
        if (saved) this.currentPackageId = Number(saved);
      },
      error: () => {
        this.packages = this.mockPackages();
        this.loading  = false;
      }
    });
  }

  // POST /api/Subscription/buy/{packageId}
  buyPackage(pkg: any): void {
    if (this.buying) return; // prevent double click
    this.buying = pkg.id;

    // Timeout safety — agar 15 sec mein response nahi aaya to button release karo
    const timeout = setTimeout(() => {
      if (this.buying === pkg.id) {
        this.buying = null;
        this.showToast('Request timed out. Please try again.', 'error');
      }
    }, 15000);

    this.http.post<any>(
      `${this.API}/Subscription/buy/${pkg.id}`,
      {},
      { headers: this.h() }
    ).subscribe({
      next: (res) => {
        clearTimeout(timeout);
        this.buying = null;
        this.currentPackageId = pkg.id;
        localStorage.setItem('currentPackageId', String(pkg.id));
        this.showToast(`✅ Successfully subscribed to ${pkg.name}!`, 'success');
      },
      error: (err) => {
        clearTimeout(timeout);
        this.buying = null;
        const msg = err?.error?.message ?? err?.message ?? 'Subscription failed. Please try again.';
        this.showToast(msg, 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 4000);
  }

  private mockPackages(): any[] {
    return [
      { id: 1, name: 'Starter',      description: 'Perfect for new agents.',         price: 29,  maxAds: 5,   maxImages: 10,  maxImagesPerAd: 3,  durationDays: 30,  subscriberCount: 120, isActive: true,  isFeatured: false },
      { id: 2, name: 'Professional', description: 'For growing professionals.',       price: 79,  maxAds: 25,  maxImages: 50,  maxImagesPerAd: 5,  durationDays: 30,  subscriberCount: 85,  isActive: true,  isFeatured: true  },
      { id: 3, name: 'Enterprise',   description: 'Full-featured plan for agencies.', price: 199, maxAds: 999, maxImages: 999, maxImagesPerAd: 10, durationDays: 365, subscriberCount: 34,  isActive: true,  isFeatured: false },
    ];
  }
}