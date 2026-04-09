import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environement';

/* =========================
   Models
========================= */

export interface Category {
  id: number;
  name: string;
}

export interface CreateCategoryDto {
  name: string;
}

export interface UpdateCategoryDto {
  name: string;
}

/* =========================
   Service
========================= */

@Injectable({
  providedIn: 'root'
})
export class CategoryService {

  private readonly baseUrl = `${environment.apiUrl}/Category`;

  constructor(private http: HttpClient) {}

  /**
   * Get all categories
   */
  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(this.baseUrl);
  }

  /**
   * Create new category
   */
  create(data: CreateCategoryDto): Observable<Category> {
    return this.http.post<Category>(this.baseUrl, data);
  }

  /**
   * Update category
   */
  update(id: number, data: UpdateCategoryDto): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/${id}`, data);
  }

  /**
   * Delete category
   */
  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}