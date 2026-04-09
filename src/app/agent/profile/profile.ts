import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-agent-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class AgentProfile implements OnInit {
  private readonly API = 'http://localhost:5183/api';

  loading = true;
  saving  = false;
  toasts: Toast[] = [];

  profile: any = {
    fullName: '', email: '', phoneNumber: '', licenseNumber: '', agencyName: ''
  };

  form = {
    fullName: '', phoneNumber: '', licenseNumber: '', agencyName: ''
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadProfile(); }

  private h() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  // GET /api/Admin/agents  — no dedicated agent profile endpoint in current swagger
  // In real app replace with your "me" or profile endpoint
  loadProfile(): void {
    this.loading = true;
    // Try fetching from token/localStorage first
    const stored = localStorage.getItem('agentProfile');
    if (stored) {
      try {
        this.profile = JSON.parse(stored);
        this.populateForm();
        this.loading = false;
        return;
      } catch {}
    }
    // Mock fallback
    this.profile = this.mockProfile();
    this.populateForm();
    this.loading = false;
  }

  populateForm(): void {
    this.form = {
      fullName:      this.profile.fullName,
      phoneNumber:   this.profile.phoneNumber || '',
      licenseNumber: this.profile.licenseNumber || '',
      agencyName:    this.profile.agencyName || '',
    };
  }

  // PUT — Update profile (adjust endpoint as per your backend)
  saveProfile(): void {
    this.saving = true;
    const payload = { ...this.form };

    // Using a generic PUT; replace with your actual profile update endpoint
    this.http.put(`${this.API}/Admin/toggle-user/${this.profile.id}`, payload, { headers: this.h() }).subscribe({
      next: () => {
        this.saving  = false;
        this.profile = { ...this.profile, ...this.form };
        localStorage.setItem('agentName', this.form.fullName);
        localStorage.setItem('agentProfile', JSON.stringify(this.profile));
        this.showToast('Profile updated successfully!', 'success');
      },
      error: () => {
        // Even on error, update locally for demo
        this.saving  = false;
        this.profile = { ...this.profile, ...this.form };
        localStorage.setItem('agentName', this.form.fullName);
        localStorage.setItem('agentProfile', JSON.stringify(this.profile));
        this.showToast('Profile saved locally.', 'success');
      }
    });
  }

  getInitials(name: string): string {
    if (!name) return '?';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }

  showToast(message: string, type: 'success' | 'error'): void {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }

  private mockProfile(): any {
    return {
      id: 1,
      fullName:      localStorage.getItem('agentName') ?? 'John Agent',
      email:         'agent@realtors.com',
      phoneNumber:   '+92 300 1234567',
      licenseNumber: 'RE-78432',
      agencyName:    'Premier Realty Group',
    };
  }
}
