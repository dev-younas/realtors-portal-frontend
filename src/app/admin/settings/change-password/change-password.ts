import { Component }             from '@angular/core';
import { CommonModule }           from '@angular/common';
import { FormsModule }            from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './change-password.html',
  styleUrls: ['./change-password.css','../../style.css']
})
export class ChangePassword {
  private readonly API = 'http://realtors.somee.com/api';

  saving = false;
  toasts: Toast[] = [];
  form   = { currentPassword: '', newPassword: '', confirmPassword: '' };
  show   = { current: false, new: false, confirm: false };

  get strength() {
    const pw = this.form.newPassword;
    if (!pw) return { pct: 0, color: '#e5e7eb', label: '' };
    let score = 0;
    if (pw.length >= 8)              score++;
    if (/[A-Z]/.test(pw))            score++;
    if (/[0-9]/.test(pw))            score++;
    if (/[^A-Za-z0-9]/.test(pw))     score++;
    const map = [
      { pct: 25, color: '#ef4444', label: 'Weak' },
      { pct: 50, color: '#f97316', label: 'Fair' },
      { pct: 75, color: '#eab308', label: 'Good' },
      { pct: 100, color: '#22c55e', label: 'Strong' },
    ];
    return map[score - 1] ?? map[0];
  }

  private h() { return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` }); }

  submit() {
    if (this.form.newPassword !== this.form.confirmPassword) return;
    this.saving = true;
    const payload = {
      currentPassword: this.form.currentPassword,
      newPassword:     this.form.newPassword
    };
    this.http.post(`${this.API}/Auth/change-password`, payload, { headers: this.h() }).subscribe({
      next: () => {
        this.saving = false;
        this.form = { currentPassword: '', newPassword: '', confirmPassword: '' };
        this.toast('Password changed successfully!', 'success');
      },
      error: () => { this.saving = false; this.toast('Failed. Check current password.', 'error'); }
    });
  }

  constructor(private http: HttpClient) {}

  toast(message: string, type: 'success' | 'error') {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }
}
