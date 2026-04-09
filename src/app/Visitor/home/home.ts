import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html',
  styleUrls: ['./home.css','../visitor.css'],
})
export class Home implements OnInit {

  listings: any[] = [];
  loading = true;

  private baseUrl = 'http://realtors.somee.com/api/Listing';

  constructor(
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.http.get<any[]>(`${this.baseUrl}/approved`).subscribe({
      next: (data) => {
        this.listings = data.slice(0, 6); // Show only 6 on homepage
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error fetching listings:', err);
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }
}