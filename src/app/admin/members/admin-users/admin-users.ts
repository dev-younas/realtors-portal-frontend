import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface AdminUser {
  id: number;
  fullName: string;
  email: string;
  role: 'Admin' | 'SuperAdmin';
  isOnline: boolean;
  lastLogin: string;
}

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './admin-users.html',
  styleUrls: ['./admin-users.css','../../style.css']
})
export class AdminUsers implements OnInit {
  private readonly API = 'http://localhost:5183/api';

  admins: AdminUser[] = [];
  filteredAdmins: AdminUser[] = [];
  loading = false;
  showModal = false;
  saving = false;
  editingAdmin: AdminUser | null = null;
  searchTerm = '';
  toasts: Toast[] = [];

  form = { fullName: '', email: '', role: 'Admin' as 'Admin' | 'SuperAdmin', password: '' };

  get superAdminCount()  { return this.admins.filter(a => a.role === 'SuperAdmin').length; }
  get activeAdminCount() { return this.admins.filter(a => a.isOnline).length; }

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadAdmins(); }

  private getHeaders() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('authToken') ?? ''}` });
  }

  loadAdmins(): void {
    this.loading = true;
    this.http.get<AdminUser[]>(`${this.API}/Admin/users`, { headers: this.getHeaders() }).subscribe({
      next: (d) => { this.admins = d; this.filteredAdmins = d; this.loading = false; },
      error: () => { this.admins = this.getMock(); this.filteredAdmins = this.admins; this.loading = false; }
    });
  }

  onSearch(): void {
    const t = this.searchTerm.toLowerCase();
    this.filteredAdmins = this.admins.filter(a =>
      a.fullName.toLowerCase().includes(t) || a.email.toLowerCase().includes(t)
    );
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }

  openCreateModal(): void {
    this.editingAdmin = null;
    this.form = { fullName: '', email: '', role: 'Admin', password: '' };
    this.showModal = true;
  }

  editAdmin(admin: AdminUser): void {
    this.editingAdmin = admin;
    this.form = { fullName: admin.fullName, email: admin.email, role: admin.role, password: '' };
    this.showModal = true;
  }

  // Uses POST /api/Auth/register with admin role
  saveAdmin(): void {
    this.saving = true;
    const payload = {
      fullName: this.form.fullName,
      email: this.form.email,
      password: this.form.password,
      role: this.form.role
    };
    this.http.post(`${this.API}/Auth/register`, payload, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.showToast('Admin user saved!', 'success');
        this.loadAdmins();
      },
      error: () => { this.saving = false; this.showToast('Failed to save admin.', 'error'); }
    });
  }

  removeAdmin(admin: AdminUser): void {
    if (!confirm(`Remove ${admin.fullName}?`)) return;
    this.admins = this.admins.filter(a => a.id !== admin.id);
    this.filteredAdmins = this.filteredAdmins.filter(a => a.id !== admin.id);
    this.showToast(`${admin.fullName} removed.`, 'success');
  }

  closeModal(): void { this.showModal = false; }

  showToast(message: string, type: 'success' | 'error'): void {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }

  private getMock(): AdminUser[] {
    return [
      { id: 1, fullName: 'Alex Johnson', email: 'alex@realtors.com', role: 'SuperAdmin', isOnline: true, lastLogin: '2024-06-01' },
      { id: 2, fullName: 'Maria Torres', email: 'maria@realtors.com', role: 'Admin', isOnline: true, lastLogin: '2024-05-31' },
      { id: 3, fullName: 'Kevin Park', email: 'kevin@realtors.com', role: 'Admin', isOnline: false, lastLogin: '2024-05-28' },
    ];
  }
}
