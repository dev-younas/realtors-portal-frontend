import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environement';

interface Seller {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  totalListings: number;
  approvedListings: number;
  pendingListings: number;
  avgListingValue: number;
  isActive: boolean;
}

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-sellers',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe],
  templateUrl: './sellers.html',
  styleUrls: ['./sellers.css','../../style.css']
})
export class Sellers implements OnInit {
  private readonly API = environment.apiUrl;
  readonly PAGE_SIZE = 8;

  sellers: Seller[] = [];
  filteredSellers: Seller[] = [];
  loading = false;
  searchTerm = '';
  statusFilter = '';
  currentPage = 1;
  toasts: Toast[] = [];

  get activeCount()      { return this.sellers.filter(s => s.isActive).length; }
  get totalListings()    { return this.sellers.reduce((s, a) => s + a.totalListings, 0); }
  get avgListingValue()  { return this.sellers.reduce((s, a) => s + a.avgListingValue, 0) / (this.sellers.length || 1); }

  get totalPages()  { return Math.max(1, Math.ceil(this.filteredSellers.length / this.PAGE_SIZE)); }
  get pageNumbers() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pageStart()   { return (this.currentPage - 1) * this.PAGE_SIZE + 1; }
  get pageEnd()     { return Math.min(this.currentPage * this.PAGE_SIZE, this.filteredSellers.length); }
  get paginatedSellers() {
    return this.filteredSellers.slice(
      (this.currentPage - 1) * this.PAGE_SIZE,
      this.currentPage * this.PAGE_SIZE
    );
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadSellers(); }

  private getHeaders() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  loadSellers(): void {
    this.loading = true;
    this.http.get<Seller[]>(`${this.API}/Admin/sellers`, { headers: this.getHeaders() }).subscribe({
      next: (data) => { this.sellers = data; this.applyFilter(); this.loading = false; },
      error: () => { this.sellers = this.getMockSellers(); this.applyFilter(); this.loading = false; }
    });
  }

  onSearch(): void { this.currentPage = 1; this.applyFilter(); }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredSellers = this.sellers.filter(s => {
      const matchSearch = !term || s.fullName.toLowerCase().includes(term) || s.email.toLowerCase().includes(term);
      const matchStatus = !this.statusFilter || (this.statusFilter === 'active' ? s.isActive : !s.isActive);
      return matchSearch && matchStatus;
    });
  }

  setPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  viewListings(s: Seller): void {
    console.log('View listings for:', s);
  }

  toggleSeller(s: Seller): void {
    s.isActive = !s.isActive;
    this.showToast(`${s.fullName} ${s.isActive ? 'restored' : 'suspended'}.`, 'success');
  }

  showToast(message: string, type: 'success' | 'error'): void {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }

  private getMockSellers(): Seller[] {
    return [
      { id: 1, fullName: 'Marco Rivera', email: 'marco@realestate.com', phone: '+1 555-0101', totalListings: 12, approvedListings: 10, pendingListings: 2, avgListingValue: 380000, isActive: true },
      { id: 2, fullName: 'Linda Chen', email: 'linda@homes.net', phone: '+1 555-0102', totalListings: 5, approvedListings: 4, pendingListings: 1, avgListingValue: 620000, isActive: true },
      { id: 3, fullName: 'David Osei', email: 'dosei@property.gh', phone: '+233 24-555-0103', totalListings: 3, approvedListings: 1, pendingListings: 2, avgListingValue: 150000, isActive: false },
      { id: 4, fullName: 'Fatima Al-Rashid', email: 'fatima@luxury.ae', phone: '+971 50-555-0104', totalListings: 20, approvedListings: 18, pendingListings: 2, avgListingValue: 1200000, isActive: true },
      { id: 5, fullName: 'Peter Novak', email: 'pnovak@housing.cz', phone: '+420 555-0105', totalListings: 7, approvedListings: 6, pendingListings: 1, avgListingValue: 295000, isActive: true },
    ];
  }
}
