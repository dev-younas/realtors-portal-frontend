import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';

interface Category { id: number; name: string; }
interface Toast { message: string; type: 'success' | 'error'; }

@Component({
  selector: 'app-seller-create-listing',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './listing-create.html',
  styleUrls: ['./listing-create.css']
})
export class ListingCreate implements OnInit {
  private readonly API = 'http://realtors.somee.com/api';

  categories: Category[] = [];
  saving    = false;
  submitted = false;
  toasts: Toast[] = [];

  // Created listing id (for image upload)
  createdListingId: number | null = null;
  selectedFiles: File[] = [];
  uploading = false;
  uploadDone = false;

  form = {
    title:       '',
    description: '',
    price:       0,
    categoryId:  0,
  };

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit() { this.loadCategories(); }

  private h() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  loadCategories() {
    this.http.get<Category[]>(`${this.API}/Category`, { headers: this.h() }).subscribe({
      next:  d  => this.categories = d,
      error: () => this.categories = [
        { id: 1, name: 'Residential' },
        { id: 2, name: 'Commercial' },
        { id: 3, name: 'Agricultural' },
      ]
    });
  }

  get isFormValid(): boolean {
    return this.form.title.trim().length > 0 &&
           this.form.price > 0 &&
           this.form.categoryId > 0;
  }

  // Step 1 — Create listing
  submit() {
    this.submitted = true;
    if (!this.isFormValid) return;

    this.saving = true;
    this.http.post<any>(`${this.API}/Listing`, this.form, { headers: this.h() }).subscribe({
      next: (res) => {
        this.saving = false;
        this.createdListingId = res?.id ?? res;
        this.toast('Listing created! Now add images.', 'success');
      },
      error: (err) => {
        this.saving = false;
        this.toast(err?.error?.message ?? err?.error ?? 'Failed to create listing.', 'error');
      }
    });
  }

  // Step 2 — Select files
  onFilesSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
    }
  }

  // Step 2 — Upload images
  uploadImages() {
    if (!this.createdListingId || this.selectedFiles.length === 0) return;

    this.uploading = true;
    const formData = new FormData();
    this.selectedFiles.forEach(f => formData.append('files', f));

    this.http.post(
      `${this.API}/Listing/${this.createdListingId}/upload-images`,
      formData,
      { headers: new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` }) }
    ).subscribe({
      next: () => {
        this.uploading  = false;
        this.uploadDone = true;
        this.toast('Images uploaded successfully!', 'success');
        setTimeout(() => this.router.navigate(['/seller/my-listings']), 1500);
      },
      error: () => {
        this.uploading = false;
        this.toast('Image upload failed.', 'error');
      }
    });
  }

  skipImages() {
    this.router.navigate(['/seller/my-listings']);
  }

  toast(message: string, type: 'success' | 'error') {
    const t: Toast = { message, type };
    this.toasts.push(t);
    setTimeout(() => this.toasts.splice(this.toasts.indexOf(t), 1), 4000);
  }
}
