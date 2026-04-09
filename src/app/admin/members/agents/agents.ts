import { Component, OnInit } from '@angular/core';
import { CommonModule, TitleCasePipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Agent {
  id: number;
  fullName: string;
  email: string;
  licenseNumber: string;
  agencyName: string;
  listingCount: number;
  subscriptionPlan: string;
  status: 'approved' | 'pending' | 'rejected';
  joinedDate: string;
}

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [CommonModule, FormsModule, TitleCasePipe, DatePipe],
  templateUrl: './agents.html',
  styleUrls: ['./agents.css','../../style.css' ]
})
export class AgentsComponent implements OnInit {
  private readonly API = 'http://realtors.somee.com/api';
  readonly PAGE_SIZE = 8;

  agents: Agent[] = [];
  filteredAgents: Agent[] = [];
  loading = false;
  searchTerm = '';
  statusFilter = '';
  currentPage = 1;
  toasts: Toast[] = [];

  get approvedCount() { return this.agents.filter(a => a.status === 'approved').length; }
  get pendingCount()  { return this.agents.filter(a => a.status === 'pending').length; }
  get totalListings() { return this.agents.reduce((s, a) => s + a.listingCount, 0); }

  get totalPages()   { return Math.max(1, Math.ceil(this.filteredAgents.length / this.PAGE_SIZE)); }
  get pageNumbers()  { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pageStart()    { return (this.currentPage - 1) * this.PAGE_SIZE + 1; }
  get pageEnd()      { return Math.min(this.currentPage * this.PAGE_SIZE, this.filteredAgents.length); }
  get paginatedAgents() {
    return this.filteredAgents.slice(
      (this.currentPage - 1) * this.PAGE_SIZE,
      this.currentPage * this.PAGE_SIZE
    );
  }

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadAgents(); }

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  loadAgents(): void {
    this.loading = true;
    // GET /api/Admin/dashboard – parse agents from dashboard or use dedicated endpoint
    this.http.get<Agent[]>(`${this.API}/Admin/agents`, { headers: this.getHeaders() }).subscribe({
      next: (data) => { this.agents = data; this.applyFilter(); this.loading = false; },
      error: () => { this.agents = this.getMockAgents(); this.applyFilter(); this.loading = false; }
    });
  }

  onSearch(): void { this.currentPage = 1; this.applyFilter(); }

  applyFilter(): void {
    const term = this.searchTerm.toLowerCase();
    this.filteredAgents = this.agents.filter(a => {
      const matchSearch = !term || a.fullName.toLowerCase().includes(term) || a.email.toLowerCase().includes(term) || a.agencyName.toLowerCase().includes(term);
      const matchStatus = !this.statusFilter || a.status === this.statusFilter;
      return matchSearch && matchStatus;
    });
  }

  setPage(p: number): void {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  // PUT /api/Admin/approve/{id}
  approveAgent(agent: Agent): void {
    this.http.put(`${this.API}/Admin/approve/${agent.id}`, {}, { headers: this.getHeaders() }).subscribe({
      next: () => { agent.status = 'approved'; this.showToast(`${agent.fullName} approved.`, 'success'); this.applyFilter(); },
      error: () => this.showToast('Approval failed.', 'error')
    });
  }

  // PUT /api/Admin/reject/{id}
  rejectAgent(agent: Agent): void {
    this.http.put(`${this.API}/Admin/reject/${agent.id}`, {}, { headers: this.getHeaders() }).subscribe({
      next: () => { agent.status = 'rejected'; this.showToast(`${agent.fullName} rejected.`, 'success'); this.applyFilter(); },
      error: () => this.showToast('Rejection failed.', 'error')
    });
  }

  viewAgent(agent: Agent): void {
    console.log('View agent:', agent);
  }

  showToast(message: string, type: 'success' | 'error'): void {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }

  private getMockAgents(): Agent[] {
    const statuses: Array<'approved' | 'pending' | 'rejected'> = ['approved', 'approved', 'pending', 'rejected', 'approved', 'pending'];
    return [
      { id: 1, fullName: 'Sarah Mitchell', email: 'sarah@realty.com', licenseNumber: 'RE-20210845', agencyName: 'Mitchell Realty', listingCount: 14, subscriptionPlan: 'Professional', status: 'approved', joinedDate: '2024-01-15' },
      { id: 2, fullName: 'James Carter', email: 'james.c@homes.net', licenseNumber: 'RE-20193312', agencyName: 'Carter & Sons', listingCount: 8, subscriptionPlan: 'Starter', status: 'pending', joinedDate: '2024-03-20' },
      { id: 3, fullName: 'Priya Sharma', email: 'priya@luxuryestate.co', licenseNumber: 'RE-20221107', agencyName: 'Luxury Estate Group', listingCount: 31, subscriptionPlan: 'Enterprise', status: 'approved', joinedDate: '2023-11-08' },
      { id: 4, fullName: 'Tom Bradley', email: 'tbradley@mail.com', licenseNumber: 'RE-20200456', agencyName: 'Bradley Properties', listingCount: 0, subscriptionPlan: 'Starter', status: 'rejected', joinedDate: '2024-05-01' },
      { id: 5, fullName: 'Aisha Okonkwo', email: 'aisha@goldkey.ng', licenseNumber: 'RE-20230789', agencyName: 'Gold Key Realtors', listingCount: 5, subscriptionPlan: 'Professional', status: 'pending', joinedDate: '2024-06-11' },
    ];
  }
}
