import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-agent-create-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './create-listing.html',
  styleUrls: ['./listing-list.css']
})
export class AgentCreateListing implements OnInit {
  private readonly API = 'http://realtors.somee.com/api';

  categories: any[] = [];
  saving    = false;
  submitted = false;
  toasts: Toast[] = [];

  form = {
    title:       '',
    description: '',
    price:       0,
    categoryId:  '',
    location:    '',
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void { this.loadCategories(); }

  private h() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  // GET /api/Category
  loadCategories(): void {
    this.http.get<any[]>(`${this.API}/Category`, { headers: this.h() }).subscribe({
      next: (data) => { this.categories = data; },
      error: () => {
        this.categories = [
          { id: 1, name: 'Apartment' }, { id: 2, name: 'Villa' },
          { id: 3, name: 'House' },     { id: 4, name: 'Plot' },
          { id: 5, name: 'Flat' },      { id: 6, name: 'Commercial' },
        ];
      }
    });
  }

  get isFormValid(): boolean {
    return this.form.title.trim().length > 0 && this.form.price > 0 && !!this.form.categoryId;
  }

  // POST /api/Listing
  submitListing(): void {
    this.submitted = true;
    if (!this.isFormValid) return;

    this.saving = true;
    const payload = {
      title:       this.form.title.trim(),
      description: this.form.description.trim(),
      price:       this.form.price,
      categoryId:  Number(this.form.categoryId),
      location:    this.form.location.trim(),
    };

    this.http.post<any>(`${this.API}/Listing`, payload, { headers: this.h() }).subscribe({
      next: (res) => {
        this.saving = false;
        this.showToast('Listing posted! It will be reviewed by admin.', 'success');
        setTimeout(() => this.router.navigate(['/agent/my-listings']), 1800);
      },
      error: (err) => {
        this.saving = false;
        this.showToast(err?.error?.message ?? 'Failed to post listing.', 'error');
      }
    });
  }

  showToast(message: string, type: 'success' | 'error'): void {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }
}
