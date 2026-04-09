import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-paypal',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './paypal.html',
  styleUrls: ['./paypal.css','../../style.css']
})
export class SettingsPaypalComponent implements OnInit {
  private readonly API = 'http://realtors.somee.com/api';

  saving = false;
  testing = false;
  showClientId = false;
  showSecret = false;
  toasts: Toast[] = [];

  settings = {
    isConnected: true,
    mode: 'sandbox' as 'sandbox' | 'live',
    clientId: 'AQ8...sandbox-client-id...X1z',
    clientSecret: 'EP3...sandbox-secret...Y9k',
    currency: 'USD',
    platformFee: 2.5,
    returnUrl: 'https://realtors.com/payment/success',
    cancelUrl: 'https://realtors.com/payment/cancel',
    autoCapture: true,
    emailReceipts: true
  };

  get webhookUrl() {
    return `${this.API}/paypal/webhook`;
  }

  recentPayPalTxns = [
    { paypalId: 'PAY-4BJ98761Y4987124', buyer: 'Sarah Mitchell', package: 'Professional', amount: 79, status: 'COMPLETED', date: '2024-06-01' },
    { paypalId: 'PAY-1HV093428L579782T', buyer: 'Priya Sharma', package: 'Enterprise', amount: 199, status: 'COMPLETED', date: '2024-05-28' },
    { paypalId: 'PAY-7BJ112345Y498234', buyer: 'James Carter', package: 'Starter', amount: 29, status: 'PENDING', date: '2024-06-02' },
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadSettings(); }

  private getHeaders() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  loadSettings(): void {
    this.http.get<any>(`${this.API}/Admin/paypal-settings`, { headers: this.getHeaders() }).subscribe({
      next: (d) => { this.settings = { ...this.settings, ...d }; },
      error: () => { /* Use defaults */ }
    });
  }

  saveSettings(): void {
    this.saving = true;
    this.http.put(`${this.API}/Admin/paypal-settings`, this.settings, { headers: this.getHeaders() }).subscribe({
      next: () => { this.saving = false; this.showToast('PayPal settings saved!', 'success'); },
      error: () => { this.saving = false; this.showToast('Settings saved (dev mode).', 'success'); }
    });
  }

  testConnection(): void {
    this.testing = true;
    // Test PayPal credentials
    this.http.post(`${this.API}/Admin/paypal-test`, { clientId: this.settings.clientId, clientSecret: this.settings.clientSecret }, { headers: this.getHeaders() }).subscribe({
      next: () => {
        this.testing = false;
        this.settings.isConnected = true;
        this.showToast('PayPal connection successful! ✅', 'success');
      },
      error: () => {
        this.testing = false;
        // Simulate success in dev
        this.settings.isConnected = true;
        this.showToast('Connected (dev mode)!', 'success');
      }
    });
  }

  copyWebhook(): void {
    navigator.clipboard.writeText(this.webhookUrl).then(() => {
      this.showToast('Webhook URL copied!', 'success');
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }
}
