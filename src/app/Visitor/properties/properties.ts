import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { NgIf, NgFor, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-properties',
  standalone: true,
  imports: [NgIf, NgFor, DecimalPipe, RouterLink],
  templateUrl: './properties.html',
  styleUrls: ['./properties.css','../visitor.css'],
})
export class Properties implements OnInit {

  listings: any[] = [];
  filteredListings: any[] = [];
  loading = true;
  errorMessage = '';

  private baseUrl = 'http://localhost:5183/api/Listing/approved';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.http.get<any[]>(this.baseUrl).subscribe({
      next: (data) => {
        this.listings = data;
        this.filteredListings = data;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = 'Failed to load properties. Please try again.';
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  // Sort listings
  onSortChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'price-low') {
      this.filteredListings = [...this.listings].sort((a, b) => a.price - b.price);
    } else if (value === 'price-high') {
      this.filteredListings = [...this.listings].sort((a, b) => b.price - a.price);
    } else {
      // newest first (default)
      this.filteredListings = [...this.listings].sort((a, b) =>
        new Date(b.createdDate).getTime() - new Date(a.createdDate).getTime()
      );
    }
    this.cdr.detectChanges();
  }
}