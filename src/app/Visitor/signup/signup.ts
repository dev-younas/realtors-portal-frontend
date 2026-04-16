import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [NgIf, RouterLink, ReactiveFormsModule],
  templateUrl: './signup.html',
  styleUrls: ['./signup.css','../visitor.css'],
})
export class Signup {
  signupForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  private apiUrl = 'https://realtors.somee.com/api/Auth/register';

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      userType: ['PrivateSeller', Validators.required],
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  // Getters — HTML mein *ngIf validation ke liye
  get userType() { return this.signupForm.get('userType'); }
  get name() { return this.signupForm.get('name'); }
  get email() { return this.signupForm.get('email'); }
  get phone() { return this.signupForm.get('phone'); }
  get password() { return this.signupForm.get('password'); }

  onSubmit() {
    if (this.signupForm.invalid) {
      this.signupForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    // Backend RegisterDto se exactly match karta hai
    const payload = {
      fullName: this.signupForm.value.name,
      email: this.signupForm.value.email,
      phoneNumber: this.signupForm.value.phone,
      password: this.signupForm.value.password,
      role: this.signupForm.value.userType  // 'PrivateSeller' | 'Agent' | 'Admin'
    };

    this.http.post<any>(this.apiUrl, payload).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.successMessage = 'Account created successfully! Redirecting to login...';
        setTimeout(() => {
          alert('✅ Account created successfully!');   
          this.router.navigate(['/visitor/login']);     
        }, 1500);
      },
      error: (err) => {
        this.isLoading = false;

        if (err.status === 0) {
          this.errorMessage = 'Cannot connect to server. Make sure backend is running.';
        } else if (err.status === 400) {
          const errors = err.error?.errors;
          if (errors) {
            const first = Object.values(errors)[0] as string[];
            this.errorMessage = first[0] || 'Please check your details.';
          } else {
            this.errorMessage = err.error?.message || 'Email may already be registered.';
          }
        } else {
          this.errorMessage = 'Something went wrong. Please try again.';
        }
      }
    });
  }
}