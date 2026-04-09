import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private apiUrl = 'http://localhost:5183/api';

  constructor(private http: HttpClient, private router: Router) {}

  login(email: string, password: string) {
    return this.http.post<any>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(tap(res => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
      }));
  }

  register(data: any) {
    return this.http.post(`${this.apiUrl}/auth/register`, data);
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  getToken() { return localStorage.getItem('token'); }
  getRole() { return localStorage.getItem('role'); }
  isLoggedIn() { return !!this.getToken(); }

  // Login ke baad role dekh ke redirect karo
  redirectByRole() {
    const role = this.getRole();
    if (role === 'Admin') this.router.navigate(['/admin/dashboard']);
    else if (role === 'Agent') this.router.navigate(['/agent/dashboard']);
    else if (role === 'PrivateSeller') this.router.navigate(['/seller/dashboard']);
    else this.router.navigate(['/']);
  }
}