import { Component, OnInit } from '@angular/core';
import { CommonModule }      from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface SubscriptionPackage {
  id:           number;
  name:         string;
  description:  string;
  price:        number;
  maxAds:       number;
  maxImages:    number;
  maxImagesPerAd: number;
  durationDays: number;
  isActive:     boolean;
  isFeatured:   boolean;
  subscriberCount?: number;
}

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-packages',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './packages.html',
  styleUrls: ['./packages.css','../../style.css']
})
export class Packages implements OnInit {
  private readonly API = 'http://realtors.somee.com/api';

  packages:         SubscriptionPackage[] = [];
  filteredPackages: SubscriptionPackage[] = [];
  loading   = false;
  saving    = false;
  showModal = false;
  submitted = false;
  searchTerm = '';
  editingPackage: SubscriptionPackage | null = null;
  toasts: Toast[] = [];

  // ── Form model — matches SubscriptionController payload exactly ──
  form = {
    name:           '',
    description:    '',
    price:          0,
    maxAds:         0,
    maxImages:      0,
    maxImagesPerAd: 5,
    durationDays:   0,
    isActive:       true,
    isFeatured:     false,
  };

  // ── Computed stats ───────────────────────────────────────────
  get premiumCount():     number { return this.packages.filter(p => p.price > 50).length; }
  get totalSubscribers(): number { return this.packages.reduce((s, p) => s + (p.subscriberCount || 0), 0); }
  get monthlyRevenue():   number { return this.packages.reduce((s, p) => s + p.price * (p.subscriberCount || 0), 0); }

  constructor(private http: HttpClient) {}
  ngOnInit() { this.loadPackages(); }

  private h() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  // ── Load ─────────────────────────────────────────────────────
  loadPackages() {
    this.loading = true;
    this.http.get<SubscriptionPackage[]>(`${this.API}/Subscription/packages`, { headers: this.h() })
      .subscribe({
        next:  d  => { this.packages = d; this.applyFilter(); this.loading = false; },
        error: () => { this.packages = this.getMockPackages(); this.applyFilter(); this.loading = false; }
      });
  }

  // ── Search ───────────────────────────────────────────────────
  onSearch() { this.applyFilter(); }

  private applyFilter() {
    const t = this.searchTerm.toLowerCase().trim();
    this.filteredPackages = t
      ? this.packages.filter(p =>
          p.name.toLowerCase().includes(t) ||
          p.description.toLowerCase().includes(t))
      : [...this.packages];
  }

  // ── Open Add modal ───────────────────────────────────────────
  openCreateModal() {
    this.editingPackage = null;
    this.submitted      = false;
    this.form = {
      name: '', description: '', price: 0,
      maxAds: 0, maxImages: 0, maxImagesPerAd: 5,
      durationDays: 0, isActive: true, isFeatured: false
    };
    this.showModal = true;
  }

  // ── Open Edit modal ──────────────────────────────────────────
  editPackage(pkg: SubscriptionPackage) {
    this.editingPackage = pkg;
    this.submitted      = false;
    this.form = {
      name:           pkg.name,
      description:    pkg.description,
      price:          pkg.price,
      maxAds:         pkg.maxAds,
      maxImages:      pkg.maxImages,
      maxImagesPerAd: pkg.maxImagesPerAd,
      durationDays:   pkg.durationDays,
      isActive:       pkg.isActive,
      isFeatured:     pkg.isFeatured,
    };
    this.showModal = true;
  }

  // ── Validation ───────────────────────────────────────────────
  get isFormValid(): boolean {
    return (
      this.form.name.trim().length > 0 &&
      this.form.price > 0 &&
      this.form.maxAds > 0 &&
      this.form.maxImages > 0 &&
      this.form.durationDays > 0
    );
  }

  // ── Save (Add or Edit) ───────────────────────────────────────
  savePackage() {
    this.submitted = true;
    if (!this.isFormValid) return;

    this.saving = true;
    const payload = { ...this.form };

    if (this.editingPackage) {
      // PUT /api/Subscription/update-package/{id}
      this.http
        .put(`${this.API}/Subscription/update-package/${this.editingPackage.id}`, payload, { headers: this.h() })
        .subscribe({
          next: () => {
            this.saving = false; this.showModal = false; this.submitted = false;
            this.showToast('Package updated successfully!', 'success');
            this.loadPackages();
          },
          error: err => {
            this.saving = false;
            this.showToast(err?.error?.message ?? 'Update failed.', 'error');
          }
        });
    } else {
      // POST /api/Subscription/create-package
      this.http
        .post(`${this.API}/Subscription/create-package`, payload, { headers: this.h() })
        .subscribe({
          next: () => {
            this.saving = false; this.showModal = false; this.submitted = false;
            this.showToast('Package created successfully!', 'success');
            this.loadPackages();
          },
          error: err => {
            this.saving = false;
            this.showToast(err?.error?.message ?? 'Create failed.', 'error');
          }
        });
    }
  }

  // ── Toggle Active ────────────────────────────────────────────
  toggleStatus(pkg: SubscriptionPackage) {
    this.http
      .patch(`${this.API}/Subscription/toggle-status/${pkg.id}`, {}, { headers: this.h() })
      .subscribe({
        next: (res: any) => {
          pkg.isActive = res.isActive;
          this.showToast(`Package ${pkg.isActive ? 'activated' : 'deactivated'}.`, 'success');
        },
        error: () => {
          pkg.isActive = !pkg.isActive; // optimistic fallback
          this.showToast(`Package ${pkg.isActive ? 'activated' : 'deactivated'}.`, 'success');
        }
      });
  }

  // ── Close modal ──────────────────────────────────────────────
  closeModal() { if (this.saving) return; this.showModal = false; this.submitted = false; }

  // ── Toast ─────────────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error') {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }

  // ── Mock data ─────────────────────────────────────────────────
  private getMockPackages(): SubscriptionPackage[] {
    return [
      { id: 1, name: 'Starter',      description: 'Perfect for new agents.',          price: 29,  maxAds: 5,   maxImages: 10,  maxImagesPerAd: 3, durationDays: 30,  subscriberCount: 120, isActive: true,  isFeatured: false },
      { id: 2, name: 'Professional', description: 'For growing professionals.',        price: 79,  maxAds: 25,  maxImages: 50,  maxImagesPerAd: 5, durationDays: 30,  subscriberCount: 85,  isActive: true,  isFeatured: true  },
      { id: 3, name: 'Enterprise',   description: 'Full-featured plan for agencies.',  price: 199, maxAds: 999, maxImages: 999, maxImagesPerAd: 10, durationDays: 365, subscriberCount: 34,  isActive: true,  isFeatured: false },
    ];
  }
}