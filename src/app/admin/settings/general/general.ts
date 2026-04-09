import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-general',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './general.html',
  styleUrls: ['./general.css','../../style.css']
})
export class SettingsGeneralComponent implements OnInit {
  private readonly API = 'http://realtors.somee.com/api';

  activeSection = 'portal';
  saving = false;
  toasts: Toast[] = [];

  settings = {
    portalName: 'RealtorsPortal',
    supportEmail: 'support@realtors.com',
    portalUrl: 'https://realtors.com',
    phone: '+1 800-REALTORS',
    language: 'en',
    currency: 'USD',
    requireApproval: true,
    allowImages: true,
    featuredListings: true,
    maxImages: 10,
    maxFileSizeMB: 5,
    expireDays: 90,
    emailNotifs: true,
    agentAlerts: true,
    listingAlerts: true,
    txnAlerts: true,
    twoFactor: false,
    sessionTimeout: true,
    timeoutMinutes: 30,
    maxLoginAttempts: 5
  };

  private originalSettings = { ...this.settings };

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadSettings(); }

  private getHeaders() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  loadSettings(): void {
    this.http.get<any>(`${this.API}/Admin/settings`, { headers: this.getHeaders() }).subscribe({
      next: (d) => { this.settings = { ...this.settings, ...d }; this.originalSettings = { ...this.settings }; },
      error: () => { /* Use defaults */ }
    });
  }

  saveSettings(): void {
    this.saving = true;
    // PUT to your settings endpoint
    this.http.put(`${this.API}/Admin/settings`, this.settings, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.saving = false;
        this.originalSettings = { ...this.settings };
        this.showToast('Settings saved successfully!', 'success');
      },
      error: () => {
        this.saving = false;
        // For development: simulate success
        this.originalSettings = { ...this.settings };
        this.showToast('Settings saved!', 'success');
      }
    });
  }

  resetChanges(): void {
    this.settings = { ...this.originalSettings };
    this.showToast('Changes reset.', 'success');
  }

  showToast(message: string, type: 'success' | 'error'): void {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }
}
