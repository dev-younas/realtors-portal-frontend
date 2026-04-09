import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { FormsModule } from '@angular/forms'; 

interface Listing {
  id: number;
  title: string;
  price: number;
  categoryName: string;
  status: string;
  images: string[];
}
interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-seller-listings',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, DecimalPipe, FormsModule],
  templateUrl: './listing-list.html',
  styleUrls: ['./listing-list.css']
})
export class ListingList implements OnInit {
  private readonly API = 'http://localhost:5183/api';

  listings: Listing[] = [];
  filtered: Listing[] = [];
  loading     = false;
  searchTerm  = '';
  statusFilter = '';
  toasts: Toast[] = [];

  readonly SIZE = 10;
  page = 1;
  get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.SIZE)); }
  get pages()      { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pageStart()  { return (this.page - 1) * this.SIZE + 1; }
  get pageEnd()    { return Math.min(this.page * this.SIZE, this.filtered.length); }
  get paginated()  { return this.filtered.slice((this.page - 1) * this.SIZE, this.page * this.SIZE); }

  get approvedCount() { return this.listings.filter(l => l.status === 'Approved').length; }
  get pendingCount()  { return this.listings.filter(l => l.status === 'Pending').length; }
  get rejectedCount() { return this.listings.filter(l => l.status === 'Rejected').length; }

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  private h() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  load() {
    this.loading = true;
    this.http.get<Listing[]>(`${this.API}/Listing/my-listings`, { headers: this.h() }).subscribe({
      next:  d  => { this.listings = d; this.applyFilter(); this.loading = false; },
      error: () => { this.listings = this.mock(); this.applyFilter(); this.loading = false; }
    });
  }

  onSearch()         { this.page = 1; this.applyFilter(); }
  setPage(p: number) { if (p >= 1 && p <= this.totalPages) this.page = p; }

  applyFilter() {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.listings.filter(l => {
      const ms = !t || l.title.toLowerCase().includes(t);
      const mf = !this.statusFilter || l.status === this.statusFilter;
      return ms && mf;
    });
  }

  toast(message: string, type: 'success' | 'error') {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }

  private mock(): Listing[] {
    return [
      { id: 1, title: '3BR Apartment, Lahore',   price: 85000,  categoryName: 'Residential', status: 'Approved', images: [] },
      { id: 2, title: 'Commercial Plot, Karachi', price: 250000, categoryName: 'Commercial',  status: 'Pending',  images: [] },
      { id: 3, title: 'Studio Flat, DHA Phase 6', price: 45000, categoryName: 'Residential', status: 'Rejected', images: [] },
    ];
  }
}
