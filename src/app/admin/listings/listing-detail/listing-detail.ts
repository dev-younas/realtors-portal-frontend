import { Component, OnInit }               from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpHeaders }            from '@angular/common/http';

interface Listing {
  id: number; title: string; category: string; agentName: string;
  agentEmail: string; agentPhone: string; price: number; status: string;
  location: string; area: number; bedrooms: number; bathrooms: number;
  description: string; createdAt: string; images: string[];
}
interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-listing-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, DecimalPipe],
  templateUrl: './listing-detail.html',
  styleUrls: ['./listing-detail.css','../../style.css']
})
export class ListingDetail implements OnInit {
  private readonly API = 'http://realtors.somee.com/api';

  listing: Listing | null = null;
  loading = true;
  toasts: Toast[] = [];

  constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.load(+id);
  }

  private h() { return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` }); }

  load(id: number) {
    // GET /api/Listing/{id}
    this.http.get<Listing>(`${this.API}/Listing/${id}`, { headers: this.h() }).subscribe({
      next: d  => { this.listing = d; this.loading = false; },
      error: () => { this.listing = this.mock(id); this.loading = false; }
    });
  }

  // PUT /api/Listing/approve/{id}
  approve() {
    if (!this.listing) return;
    this.http.put(`${this.API}/Listing/approve/${this.listing.id}`, {}, { headers: this.h() }).subscribe({
      next: () => { this.listing!.status = 'Approved'; this.toast('Approved!', 'success'); },
      error: () => this.toast('Failed.', 'error')
    });
  }

  // PUT /api/Listing/reject/{id}
  reject() {
    if (!this.listing) return;
    this.http.put(`${this.API}/Listing/reject/${this.listing.id}`, {}, { headers: this.h() }).subscribe({
      next: () => { this.listing!.status = 'Rejected'; this.toast('Rejected.', 'success'); },
      error: () => this.toast('Failed.', 'error')
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  toast(message: string, type: 'success' | 'error') {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }

  private mock(id: number): Listing {
    return {
      id, title: '3BR Apartment, Lahore', category: 'Residential',
      agentName: 'Sarah Mitchell', agentEmail: 'sarah@realty.com', agentPhone: '+92 300 1234567',
      price: 85000, status: 'Pending', location: 'DHA Phase 5, Lahore',
      area: 1800, bedrooms: 3, bathrooms: 2,
      description: 'Beautiful 3-bedroom apartment in the heart of DHA. Modern design, fully equipped kitchen, 24/7 security, and ample parking.',
      createdAt: '2024-06-01', images: []
    };
  }
}
