import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe, TitleCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Transaction {
  id: string;
  buyerName: string;
  buyerEmail: string;
  packageName: string;
  amount: number;
  paymentMethod: string;
  status: 'completed' | 'pending' | 'failed' | 'refunded';
  date: string;
}

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, DecimalPipe, DatePipe, TitleCasePipe],
  templateUrl: './transactions.html',
  styleUrls: ['./transactions.css','../../style.css']
})
export class Transactions implements OnInit {
  private readonly API = 'http://localhost:5183/api';
  readonly PAGE_SIZE = 10;

  transactions: Transaction[] = [];
  filteredTxns: Transaction[] = [];
  loading = false;
  searchTerm = '';
  statusFilter = '';
  currentPage = 1;
  toasts: Toast[] = [];

  get totalRevenue()   { return this.transactions.filter(t => t.status === 'completed').reduce((s, t) => s + t.amount, 0); }
  get completedCount() { return this.transactions.filter(t => t.status === 'completed').length; }
  get refundedCount()  { return this.transactions.filter(t => t.status === 'refunded').length; }

  get totalPages()  { return Math.max(1, Math.ceil(this.filteredTxns.length / this.PAGE_SIZE)); }
  get pageNumbers() { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pageStart()   { return (this.currentPage - 1) * this.PAGE_SIZE + 1; }
  get pageEnd()     { return Math.min(this.currentPage * this.PAGE_SIZE, this.filteredTxns.length); }
  get paginatedTxns() {
    return this.filteredTxns.slice(
      (this.currentPage - 1) * this.PAGE_SIZE,
      this.currentPage * this.PAGE_SIZE
    );
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadTransactions(); }

  private getHeaders() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  loadTransactions(): void {
    this.loading = true;
    // GET /api/Admin/dashboard-stats includes transaction data
    this.http.get<Transaction[]>(`${this.API}/Admin/transactions`, { headers: this.getHeaders() }).subscribe({
      next: (d) => { this.transactions = d; this.applyFilter(); this.loading = false; },
      error: () => { this.transactions = this.getMock(); this.applyFilter(); this.loading = false; }
    });
  }

  onSearch(): void { this.currentPage = 1; this.applyFilter(); }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredTxns = this.transactions.filter(t => {
      const matchSearch = !term || t.buyerName.toLowerCase().includes(term) || t.id.toLowerCase().includes(term) || t.packageName.toLowerCase().includes(term);
      const matchStatus = !this.statusFilter || t.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  setPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  exportCSV(): void {
    const headers = ['ID', 'Buyer', 'Email', 'Package', 'Amount', 'Method', 'Status', 'Date'];
    const rows = this.filteredTxns.map(t => [t.id, t.buyerName, t.buyerEmail, t.packageName, t.amount, t.paymentMethod, t.status, t.date]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const a = document.createElement('a');
    a.href = 'data:text/csv,' + encodeURIComponent(csv);
    a.download = 'transactions.csv';
    a.click();
    this.showToast('CSV exported!', 'success');
  }

  showToast(message: string, type: 'success' | 'error'): void {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }

  private getMock(): Transaction[] {
    return [
      { id: 'TXN-001', buyerName: 'Sarah Mitchell', buyerEmail: 'sarah@realty.com', packageName: 'Professional', amount: 79, paymentMethod: 'PayPal', status: 'completed', date: '2024-06-01T10:23:00' },
      { id: 'TXN-002', buyerName: 'James Carter', buyerEmail: 'james@homes.net', packageName: 'Starter', amount: 29, paymentMethod: 'Credit Card', status: 'completed', date: '2024-05-28T14:05:00' },
      { id: 'TXN-003', buyerName: 'Priya Sharma', buyerEmail: 'priya@luxury.co', packageName: 'Enterprise', amount: 199, paymentMethod: 'PayPal', status: 'completed', date: '2024-05-25T09:41:00' },
      { id: 'TXN-004', buyerName: 'Tom Bradley', buyerEmail: 'tbradley@mail.com', packageName: 'Starter', amount: 29, paymentMethod: 'Credit Card', status: 'refunded', date: '2024-05-20T16:30:00' },
      { id: 'TXN-005', buyerName: 'Aisha Okonkwo', buyerEmail: 'aisha@goldkey.ng', packageName: 'Professional', amount: 79, paymentMethod: 'PayPal', status: 'pending', date: '2024-06-02T08:15:00' },
      { id: 'TXN-006', buyerName: 'Marco Rivera', buyerEmail: 'marco@realestate.com', packageName: 'Professional', amount: 79, paymentMethod: 'Credit Card', status: 'failed', date: '2024-06-02T11:45:00' },
    ];
  }
}
