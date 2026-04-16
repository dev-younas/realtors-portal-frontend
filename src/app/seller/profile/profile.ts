import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environement';

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-seller-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './profile.html',
  styleUrls: ['./profile.css']
})
export class SellerProfile implements OnInit {
  private readonly API = environment.apiUrl;

  loading = true;
  saving  = false;
  toasts: Toast[] = [];

  profile = {
    fullName:    '',
    email:       '',
    phoneNumber: '',
    createdDate: '',
  };

  // Password change
  showPwForm  = false;
  pwSaving    = false;
  pwSubmitted = false;
  pw = { current: '', newPw: '', confirm: '' };
  get pwMismatch() { return this.pw.newPw && this.pw.confirm && this.pw.newPw !== this.pw.confirm; }

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  private h() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  load() {
    this.loading = true;
    this.http.get<any>(`${this.API}/Auth/me`, { headers: this.h() }).subscribe({
      next: (d) => {
        this.profile = {
          fullName:    d.fullName    ?? '',
          email:       d.email       ?? '',
          phoneNumber: d.phoneNumber ?? '',
          createdDate: d.createdDate ?? '',
        };
        this.loading = false;
      },
      error: () => {
        this.profile = { fullName: 'Agent User', email: 'agent@portal.com', phoneNumber: '+92 300 0000000', createdDate: '2024-01-01' };
        this.loading = false;
      }
    });
  }

  getInitials(): string {
    return this.profile.fullName.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?';
  }

  save() {
    this.saving = true;
    this.http.put(`${this.API}/Auth/update-profile`, this.profile, { headers: this.h() }).subscribe({
      next: () => { this.saving = false; this.toast('Profile updated!', 'success'); },
      error: (err) => { this.saving = false; this.toast(err?.error?.message ?? 'Update failed.', 'error'); }
    });
  }

  changePassword() {
    this.pwSubmitted = true;
    if (!this.pw.current || !this.pw.newPw || this.pwMismatch) return;
    this.pwSaving = true;
    this.http.post(`${this.API}/Auth/change-password`, { currentPassword: this.pw.current, newPassword: this.pw.newPw }, { headers: this.h() }).subscribe({
      next: () => {
        this.pwSaving    = false;
        this.showPwForm  = false;
        this.pwSubmitted = false;
        this.pw = { current: '', newPw: '', confirm: '' };
        this.toast('Password changed!', 'success');
      },
      error: (err) => { this.pwSaving = false; this.toast(err?.error?.message ?? 'Failed.', 'error'); }
    });
  }

  toast(message: string, type: 'success' | 'error') {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }
}
