import { Component, OnInit }            from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { RouterModule, Router }          from '@angular/router';
import { HttpClient, HttpHeaders }        from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../environments/environement';

@Component({
  selector: 'app-agent-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, DatePipe, DecimalPipe, FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AgentDashboard implements OnInit {
  private readonly API = environment.apiUrl;

  loading   = true;
  today     = new Date();
  agentName = 'Agent';

  stats = {
    totalListings:    0,
    approvedListings: 0,
    pendingListings:  0,
    rejectedListings: 0,
    packageName:      '',
    adsRemaining:     0,
  };

  recentListings: any[] = [];

  constructor(private http: HttpClient, private router: Router) {}

  ngOnInit(): void {
    this.agentName = localStorage.getItem('agentName') ?? 'Agent';
    this.loadDashboard();
  }

  // ── Button click — 100% reliable navigation ──────────────────
  goToCreate(): void {
    this.router.navigate(['/agent/my-listings/create']);
  }

  
showModal = false;

openModal(): void {
  this.showModal = true;
}

closeModal(): void {
  this.showModal = false;
}

  private getHeaders() {
    return new HttpHeaders({ Authorization: `Bearer ${localStorage.getItem('token') ?? ''}` });
  }

  loadDashboard(): void {
    this.http.get<any[]>(`${this.API}/Listing/my-listings`, { headers: this.getHeaders() }).subscribe({
      next: (listings) => {
        this.recentListings          = listings.slice(0, 5);
        this.stats.totalListings     = listings.length;
        this.stats.approvedListings  = listings.filter(l => l.status === 'Approved').length;
        this.stats.pendingListings   = listings.filter(l => l.status === 'Pending').length;
        this.stats.rejectedListings  = listings.filter(l => l.status === 'Rejected').length;
        this.loading = false;
        this.loadMyPackage();
      },
      error: () => {
        this.recentListings = this.mockListings();
        this.stats          = this.mockStats();
        this.loading        = false;
      }
    });
  }

  loadMyPackage(): void {
    this.http.get<any>(`${this.API}/Subscription/packages`, { headers: this.getHeaders() }).subscribe({
      next: (data) => {
        if (Array.isArray(data)) {
          const active = data.find((p: any) => p.isActive);
          if (active) {
            this.stats.packageName  = active.name;
            this.stats.adsRemaining = active.maxAds - this.stats.totalListings;
          }
        } else if (data?.name) {
          this.stats.packageName  = data.name;
          this.stats.adsRemaining = data.maxAds - this.stats.totalListings;
        }
      },
      error: () => {
        this.stats.packageName  = 'Professional';
        this.stats.adsRemaining = 25 - this.stats.totalListings;
      }
    });
  }

  submitListing(form: any) {
  console.log("FORM SUBMITTED");
  console.log(form);
}

//   submitListing(form: any) {
//   if (form.invalid) return;

//   console.log(form.value);

//   this.http.post(`${this.API}/Listing`, form.value, {
//     headers: this.getHeaders()
//   }).subscribe({
//     next: () => {
//       this.closeModal();
//       this.loadDashboard();
//       form.reset();
//     },
//     error: (err) => {
//       console.error(err);
//     }
//   });
// } 

  private mockStats() {
    return {
      totalListings: 12, approvedListings: 8, pendingListings: 3,
      rejectedListings: 1, packageName: 'Professional', adsRemaining: 13
    };
  }

  private mockListings() {
    return [
      { id: 1, title: '3BR Apartment, Lahore',     categoryName: 'Apartment', price: 120000, status: 'Approved', createdDate: '2024-06-01' },
      { id: 2, title: 'Commercial Plot, Karachi',  categoryName: 'Plot',      price: 450000, status: 'Pending',  createdDate: '2024-06-02' },
      { id: 3, title: 'Villa with Garden, DHA',    categoryName: 'Villa',     price: 890000, status: 'Approved', createdDate: '2024-05-30' },
      { id: 4, title: 'Studio Flat, Gulberg',      categoryName: 'Flat',      price: 65000,  status: 'Rejected', createdDate: '2024-05-29' },
      { id: 5, title: '5 Marla House, Faisalabad', categoryName: 'House',     price: 210000, status: 'Approved', createdDate: '2024-05-28' },
    ];
  }
}