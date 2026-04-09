import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environement';
import { Listing } from '../models/listing.model';

@Injectable({
  providedIn: 'root'
})
export class ListingService {

  private baseUrl = `${environment.apiUrl}/Listing`;

  constructor(private http: HttpClient) {}

  getApprovedListings(): Observable<Listing[]> {
    return this.http.get<Listing[]>(`${this.baseUrl}/approved`);
  }
}