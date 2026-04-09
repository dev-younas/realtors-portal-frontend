import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface Package {
  id: number; name: string; description: string;
  price: number; durationDays: number;
  maxAds: number; maxImages: number; maxImagesPerAd: number;
  isActive: boolean; isFeatured: boolean;
}
interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-seller-plans',
  standalone: true,
  imports: [CommonModule, DecimalPipe],
  templateUrl: './plans.html',
  styleUrls: ['./plans.css']
})
export class SellerPlans implements OnInit {
  private readonly API = 'http://realtors.somee.com/api';

  packages: Package[] = [];
  loading  = false;
  buying   = false;
  buyingId = 0;
  toasts: Toast[] = [];

  constructor(private http: HttpClient, private router: Router) {}
  ngOnInit() { this.load(); }

  private h() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  load() {
    this.loading = true;
    this.http.get<Package[]>(`${this.API}/Subscription/packages`, { headers: this.h() }).subscribe({
      next:  d  => { this.packages = d.filter(p => p.isActive); this.loading = false; },
      error: () => { this.packages = this.mock(); this.loading = false; }
    });
  }

  buy(pkg: Package) {
    this.buying   = true;
    this.buyingId = pkg.id;
    this.http.post(`${this.API}/Subscription/buy/${pkg.id}`, {}, { headers: this.h() }).subscribe({
      next: () => {
        this.buying = false;
        this.toast(`${pkg.name} activated successfully!`, 'success');
        setTimeout(() => this.router.navigate(['/seller/packages/my-package']), 1500);
      },
      error: (err) => {
        this.buying = false;
        this.toast(err?.error?.message ?? 'Purchase failed.', 'error');
      }
    });
  }

  toast(message: string, type: 'success' | 'error') {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 4000);
  }

  private mock(): Package[] {
    return [
      { id: 1, name: 'Starter',      description: 'Perfect for new sellers.',          price: 29,  durationDays: 30,  maxAds: 5,   maxImages: 10,  maxImagesPerAd: 3,  isActive: true, isFeatured: false },
      { id: 2, name: 'Professional', description: 'For growing real estate agents.',   price: 79,  durationDays: 30,  maxAds: 25,  maxImages: 50,  maxImagesPerAd: 5,  isActive: true, isFeatured: true  },
      { id: 3, name: 'Enterprise',   description: 'Unlimited access for agencies.',    price: 199, durationDays: 365, maxAds: 999, maxImages: 999, maxImagesPerAd: 10, isActive: true, isFeatured: false },
    ];
  }
}
