import { Component, OnInit } from '@angular/core';
import { CommonModule, DecimalPipe, DatePipe } from '@angular/common';
import { FormsModule }       from '@angular/forms';
import { RouterModule }      from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-agent-listing-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, DecimalPipe, DatePipe],
  templateUrl: './listing-list.html',
  styleUrls: ['./listing-list.css']
})
export class AgentListingList implements OnInit {
  private readonly API = 'http://realtors.somee.com/api';

  listings: any[] = [];
  filtered: any[] = [];
  paginated: any[] = [];

  loading     = true;
  searchTerm  = '';
  statusFilter = '';
  page        = 1;
  pageSize    = 10;
  toasts: Toast[] = [];

  selectedListing: any = null;
  showModal       = false;
  showUploadModal = false;
  showDeleteModal = false;
  uploading       = false;
  selectedFiles: File[] = [];
  maxImagesPerAd  = 5;

  constructor(private http: HttpClient) {}

  ngOnInit(): void { this.loadListings(); }

  private h() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  // ── Computed stats ───────────────────────────────────────────
  get approvedCount(): number { return this.listings.filter(l => l.status === 'Approved').length; }
  get pendingCount():  number { return this.listings.filter(l => l.status === 'Pending').length;  }
  get rejectedCount(): number { return this.listings.filter(l => l.status === 'Rejected').length; }

  // ── Pagination ───────────────────────────────────────────────
  get totalPages(): number { return Math.ceil(this.filtered.length / this.pageSize) || 1; }
  get pages(): number[] { return Array.from({ length: this.totalPages }, (_, i) => i + 1); }
  get pageStart(): number { return (this.page - 1) * this.pageSize + 1; }
  get pageEnd():   number { return Math.min(this.page * this.pageSize, this.filtered.length); }

  setPage(p: number) {
    if (p < 1 || p > this.totalPages) return;
    this.page = p;
    this.paginated = this.filtered.slice((p - 1) * this.pageSize, p * this.pageSize);
  }

  // ── Load: GET /api/Listing/my-listings ───────────────────────
  loadListings(): void {
    this.loading = true;
    this.http.get<any[]>(`${this.API}/Listing/my-listings`, { headers: this.h() }).subscribe({
      next: (data) => {
        this.listings = data;
        this.applyFilter();
        this.loading = false;
      },
      error: () => {
        this.listings = this.mockListings();
        this.applyFilter();
        this.loading = false;
      }
    });
  }

  // ── Search / Filter ──────────────────────────────────────────
  onSearch(): void { this.page = 1; this.applyFilter(); }

  private applyFilter(): void {
    const term   = this.searchTerm.toLowerCase().trim();
    const status = this.statusFilter;
    this.filtered = this.listings.filter(l => {
      const matchText   = !term   || l.title?.toLowerCase().includes(term) || l.category?.toLowerCase().includes(term);
      const matchStatus = !status || l.status === status;
      return matchText && matchStatus;
    });
    this.setPage(this.page);
  }

  // ── View detail ──────────────────────────────────────────────
  viewDetail(l: any): void {
    this.selectedListing = l;
    this.showModal = true;
  }
  closeModal(): void { this.showModal = false; }

  // ── Upload Images: POST /api/Listing/{id}/upload-images ──────
  uploadImages(l: any): void {
    this.selectedListing = l;
    this.selectedFiles = [];
    this.showUploadModal = true;
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files).slice(0, this.maxImagesPerAd);
    }
  }

  submitImages(): void {
    if (!this.selectedListing || this.selectedFiles.length === 0) return;
    this.uploading = true;

    const formData = new FormData();
    this.selectedFiles.forEach(file => formData.append('images', file));

    this.http.post(
      `${this.API}/Listing/${this.selectedListing.id}/upload-images`,
      formData,
      { headers: new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` }) }
    ).subscribe({
      next: () => {
        this.uploading = false;
        this.showUploadModal = false;
        this.showToast('Images uploaded successfully!', 'success');
        this.loadListings();
      },
      error: (err) => {
        this.uploading = false;
        this.showToast(err?.error?.message ?? 'Upload failed.', 'error');
      }
    });
  }

  closeUploadModal(): void { if (this.uploading) return; this.showUploadModal = false; }

  // ── Delete: DELETE /api/Listing/{id}  (using Admin endpoint)
  //    If agent has own delete endpoint adjust the path accordingly
  confirmDelete(l: any): void {
    this.selectedListing = l;
    this.showDeleteModal = true;
  }

  deleteListing(): void {
    if (!this.selectedListing) return;
    this.http.delete(`${this.API}/Admin/listing/${this.selectedListing.id}`, { headers: this.h() }).subscribe({
      next: () => {
        this.showDeleteModal = false;
        this.showToast('Listing deleted.', 'success');
        this.loadListings();
      },
      error: (err) => {
        this.showDeleteModal = false;
        this.showToast(err?.error?.message ?? 'Delete failed.', 'error');
      }
    });
  }

  closeDeleteModal(): void { this.showDeleteModal = false; }

  // ── Toast ─────────────────────────────────────────────────────
  showToast(message: string, type: 'success' | 'error'): void {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 3500);
  }

  // ── Mock ─────────────────────────────────────────────────────
  private mockListings(): any[] {
    return [
      { id: 1, title: '3BR Apartment, Lahore',     category: 'Apartment', price: 120000, imageCount: 4, status: 'Approved', createdDate: '2024-06-01', expiryDate: '2024-07-01', description: 'Beautiful 3 bedroom apartment.' },
      { id: 2, title: 'Commercial Plot, Karachi',  category: 'Plot',      price: 450000, imageCount: 2, status: 'Pending',  createdDate: '2024-06-02', expiryDate: '2024-07-02', description: 'Prime location commercial plot.' },
      { id: 3, title: 'Villa with Garden, DHA',    category: 'Villa',     price: 890000, imageCount: 8, status: 'Approved', createdDate: '2024-05-30', expiryDate: '2024-06-30', description: '5 bedroom villa with large garden.' },
      { id: 4, title: 'Studio Flat, Gulberg',      category: 'Flat',      price: 65000,  imageCount: 3, status: 'Rejected', createdDate: '2024-05-29', expiryDate: '2024-06-29', description: 'Cozy studio flat.' },
      { id: 5, title: '5 Marla House, Faisalabad', category: 'House',     price: 210000, imageCount: 5, status: 'Approved', createdDate: '2024-05-28', expiryDate: '2024-06-28', description: 'Well maintained house.' },
    ];
  }
}
