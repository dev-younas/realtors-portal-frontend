import { Component, OnInit }                    from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe }  from '@angular/common';
import { FormsModule }                          from '@angular/forms';
import { HttpClient, HttpHeaders }              from '@angular/common/http';

interface Listing {
  id:          number;
  title:       string;
  description: string;
  category:    string;
  ownerName:   string;   // ✅ was agentName
  ownerEmail:  string;   // ✅ was agentEmail
  price:       number;
  status:      string;
  isActive:    boolean;
  createdDate: string;
  expiryDate:  string;
  images:      string[];
}

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-listing-list',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe, DecimalPipe],
  templateUrl: './listing-list.html',
  styleUrls: ['./listing-list.css','../../style.css']
})
export class ListingList implements OnInit {
  private readonly API = 'http://realtors.somee.com/api';
  readonly SIZE = 10;

  listings: Listing[] = [];
  filtered: Listing[] = [];
  loading      = false;
  searchTerm   = '';
  statusFilter = '';
  page         = 1;
  toasts: Toast[] = [];

  // ── Detail Modal ─────────────────────────────────────────────
  showModal        = false;
  selectedListing: Listing | null = null;
  activeImage      = '';

  // ── Stats ─────────────────────────────────────────────────────
  get approvedCount() { return this.listings.filter(l => l.status === 'Approved').length; }
  get pendingCount()  { return this.listings.filter(l => l.status === 'Pending').length; }
  get rejectedCount() { return this.listings.filter(l => l.status === 'Rejected').length; }

  // ── Pagination ────────────────────────────────────────────────
  get totalPages() { return Math.max(1, Math.ceil(this.filtered.length / this.SIZE)); }
  get pages()      { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pageStart()  { return (this.page - 1) * this.SIZE + 1; }
  get pageEnd()    { return Math.min(this.page * this.SIZE, this.filtered.length); }
  get paginated()  { return this.filtered.slice((this.page - 1) * this.SIZE, this.page * this.SIZE); }

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  private h() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  // ── Load ALL listings (admin endpoint) ───────────────────────
  load() {
    this.loading = true;
    this.http.get<Listing[]>(`${this.API}/Admin/all-listings`, { headers: this.h() }).subscribe({
      next:  d  => { this.listings = d; this.applyFilter(); this.loading = false; },
      error: () => { this.listings = this.mock(); this.applyFilter(); this.loading = false; }
    });
  }

  onSearch()         { this.page = 1; this.applyFilter(); }
  setPage(p: number) { if (p >= 1 && p <= this.totalPages) this.page = p; }

  applyFilter() {
    const t = this.searchTerm.toLowerCase();
    this.filtered = this.listings.filter(l => {
      const ms = !t || l.title.toLowerCase().includes(t) || l.ownerName.toLowerCase().includes(t);
      const mf = !this.statusFilter || l.status === this.statusFilter;
      return ms && mf;
    });
  }

  // ── Approve ───────────────────────────────────────────────────
  approve(l: Listing) {
    this.http.put(`${this.API}/Listing/approve/${l.id}`, {}, { headers: this.h() }).subscribe({
      next: () => {
        l.status = 'Approved';
        if (this.selectedListing?.id === l.id) this.selectedListing.status = 'Approved';
        this.toast('Listing approved!', 'success');
        this.applyFilter();
      },
      error: () => this.toast('Approve failed.', 'error')
    });
  }

  // ── Reject ────────────────────────────────────────────────────
  reject(l: Listing) {
    this.http.put(`${this.API}/Listing/reject/${l.id}`, {}, { headers: this.h() }).subscribe({
      next: () => {
        l.status = 'Rejected';
        if (this.selectedListing?.id === l.id) this.selectedListing.status = 'Rejected';
        this.toast('Listing rejected.', 'success');
        this.applyFilter();
      },
      error: () => this.toast('Reject failed.', 'error')
    });
  }

  // ── View Detail Modal ─────────────────────────────────────────
  viewDetail(l: Listing) {
    this.selectedListing = l;
    this.activeImage     = l.images?.[0] ?? '';
    this.showModal       = true;
  }

  closeModal()              { this.showModal = false; this.selectedListing = null; }
  setActiveImage(url: string) { this.activeImage = url; }

  // ── Toast ─────────────────────────────────────────────────────
  toast(message: string, type: 'success' | 'error') {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }

  // ── Mock ──────────────────────────────────────────────────────
  private mock(): Listing[] {
    return [
      { id: 1, title: '3BR Apartment, Lahore',    description: 'Spacious 3-bedroom apartment.', category: 'Residential',  ownerName: 'Sarah Mitchell', ownerEmail: 'sarah@mail.com', price: 85000,  status: 'Approved', isActive: true, createdDate: '2024-06-01', expiryDate: '2024-12-01', images: [] },
      { id: 2, title: 'Commercial Plot, Karachi',  description: 'Prime commercial plot.',         category: 'Commercial',   ownerName: 'James Carter',   ownerEmail: 'james@mail.com', price: 250000, status: 'Pending',  isActive: true, createdDate: '2024-06-02', expiryDate: '2024-12-02', images: [] },
      { id: 3, title: '5 Marla Villa, Islamabad',  description: 'Beautiful villa with garden.',   category: 'Residential',  ownerName: 'Priya Sharma',   ownerEmail: 'priya@mail.com', price: 320000, status: 'Approved', isActive: true, createdDate: '2024-05-30', expiryDate: '2024-11-30', images: [] },
      { id: 4, title: 'Studio Flat, DHA Phase 6',  description: 'Compact studio flat.',           category: 'Residential',  ownerName: 'Tom Bradley',    ownerEmail: 'tom@mail.com',   price: 45000,  status: 'Rejected', isActive: true, createdDate: '2024-05-29', expiryDate: '2024-11-29', images: [] },
      { id: 5, title: 'Agricultural Land, Multan', description: 'Fertile agricultural land.',     category: 'Agricultural', ownerName: 'Aisha Okonkwo',  ownerEmail: 'aisha@mail.com', price: 120000, status: 'Pending',  isActive: true, createdDate: '2024-06-03', expiryDate: '2024-12-03', images: [] },
    ];
  }
}