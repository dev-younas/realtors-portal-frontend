import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [NgIf, RouterLink, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrls: ['./login.css','../visitor.css'],
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private apiUrl = 'http://realtors.somee.com/api/Auth/login';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const payload = {
      email: this.loginForm.value.email,
      password: this.loginForm.value.password
    };

    this.http.post<any>(this.apiUrl, payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        localStorage.setItem('token', res.token);
        localStorage.setItem('role', res.role);
        localStorage.setItem('userEmail', res.email || payload.email);

        this.successMessage = 'Login successful! Redirecting...';

        setTimeout(() => {
          if (res.role === 'Admin') {
            this.router.navigate(['/admin']);
          } else if (res.role === 'Agent') {
            this.router.navigate(['/agent']);
          } else if (res.role === 'PrivateSeller') {
            this.router.navigate(['/seller']);
          } else {
            this.router.navigate(['/']);
          }
        }, 1000);
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 401) {
          this.errorMessage = 'Invalid email or password. Please try again.';
        } else if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Please check if backend is running.';
        } else {
          this.errorMessage = err.error?.message || 'Something went wrong. Please try again.';
        }
      }
    });
  }
}