import { Component, OnInit }      from '@angular/core';
import { CommonModule, DatePipe }  from '@angular/common';
import { FormsModule }             from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Category {
  id: number;
  name: string;
  description: string;
  listingCount: number;
  createdAt: string;
}

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './categories.html',
  styleUrls: ['./categories.css','../../style.css']
})
export class Categories implements OnInit {
  private readonly API = 'http://localhost:5183/api';

  categories: Category[] = [];
  filtered:   Category[] = [];
  loading  = false;
  saving   = false;
  showModal = false;
  submitted = false;          // ← NEW: tracks if Save was clicked (for validation)
  searchTerm = '';
  editing: Category | null = null;
  form = { name: '', description: '' };
  toasts: Toast[] = [];

  constructor(private http: HttpClient) {}
  ngOnInit() { this.load(); }

  // ── Auth header ──────────────────────────────────────────────
  private h() {
    return new HttpHeaders({
      Authorization: `Bearer ${localStorage.getItem('token') ?? ''}`
    });
  }

  // ── Load all categories ──────────────────────────────────────
  load() {
    this.loading = true;
    this.http.get<Category[]>(`${this.API}/Category`, { headers: this.h() }).subscribe({
      next: d  => { this.categories = d; this.applyFilter(); this.loading = false; },
      error: () => { this.categories = this.mock(); this.applyFilter(); this.loading = false; }
    });
  }

  // ── Search / filter ──────────────────────────────────────────
  onSearch() { this.applyFilter(); }

  private applyFilter() {
    const t = this.searchTerm.toLowerCase().trim();
    this.filtered = t
      ? this.categories.filter(c => c.name.toLowerCase().includes(t) || c.description?.toLowerCase().includes(t))
      : [...this.categories];
  }

  // ── Open Add modal ───────────────────────────────────────────
  openCreate() {
    this.editing   = null;
    this.submitted = false;
    this.form      = { name: '', description: '' };
    this.showModal = true;
  }

  // ── Open Edit modal ──────────────────────────────────────────
  openEdit(c: Category) {
    this.editing   = c;
    this.submitted = false;
    this.form      = { name: c.name, description: c.description };
    this.showModal = true;
  }

  // ── Save (Create or Update) ──────────────────────────────────
  save() {
    this.submitted = true;

    // Basic validation
    if (!this.form.name.trim()) return;

    this.saving = true;

    if (this.editing) {
      // ── PUT /api/Category/{id} ── UPDATE
      this.http
        .put(`${this.API}/Category/${this.editing.id}`, this.form, { headers: this.h() })
        .subscribe({
          next: () => {
            this.saving    = false;
            this.showModal = false;
            this.submitted = false;
            this.toast('Category updated successfully!', 'success');
            this.load();
          },
          error: (err) => {
            this.saving = false;
            this.toast(err?.error?.message ?? 'Update failed. Please try again.', 'error');
          }
        });
    } else {
      // ── POST /api/Category ── CREATE
      this.http
        .post(`${this.API}/Category`, this.form, { headers: this.h() })
        .subscribe({
          next: () => {
            this.saving    = false;
            this.showModal = false;
            this.submitted = false;
            this.toast('Category created successfully!', 'success');
            this.load();
          },
          error: (err) => {
            this.saving = false;
            this.toast(err?.error?.message ?? 'Create failed. Please try again.', 'error');
          }
        });
    }
  }

  // ── Delete ───────────────────────────────────────────────────
  deleteCategory(c: Category) {
    if (!confirm(`Are you sure you want to delete "${c.name}"?\nThis action cannot be undone.`)) return;

    this.http.delete(`${this.API}/Category/${c.id}`, { headers: this.h() }).subscribe({
      next: () => { this.toast(`"${c.name}" deleted.`, 'success'); this.load(); },
      error: (err) => this.toast(err?.error?.message ?? 'Delete failed.', 'error')
    });
  }

  // ── Close modal ──────────────────────────────────────────────
  closeModal() {
    if (this.saving) return;   // don't close while saving
    this.showModal = false;
    this.submitted = false;
  }

  // ── Toast ─────────────────────────────────────────────────────
  toast(message: string, type: 'success' | 'error') {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }

  // ── Helper: stat card methods ────────────────────────────────
  getTotalListings(): number {
    return this.categories.reduce((sum, c) => sum + (c.listingCount ?? 0), 0);
  }

  getTopCategory(): string {
    if (!this.categories.length) return '—';
    return this.categories.reduce((a, b) => a.listingCount > b.listingCount ? a : b).name;
  }

  // ── Mock data (fallback when API is down) ────────────────────
  private mock(): Category[] {
    return [
      { id: 1, name: 'Residential',  description: 'Houses, apartments, villas', listingCount: 120, createdAt: '2024-01-10' },
      { id: 2, name: 'Commercial',   description: 'Shops, offices, plazas',     listingCount: 45,  createdAt: '2024-01-12' },
      { id: 3, name: 'Agricultural', description: 'Farms, agricultural land',   listingCount: 22,  createdAt: '2024-02-01' },
      { id: 4, name: 'Industrial',   description: 'Factories, warehouses',      listingCount: 18,  createdAt: '2024-02-15' },
    ];
  }
}

