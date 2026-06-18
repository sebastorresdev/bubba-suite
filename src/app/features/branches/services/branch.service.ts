import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { BranchResponse, CreateBranchRequest, UpdateBranchRequest } from '../models/branch.models';

@Injectable({ providedIn: 'root' })
export class BranchService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/branches`;

  // 🌟 Explícito, seguro y con auto-completado total en componentes y HTML
  getAll(): Observable<BranchResponse[]> {
    return this.http.get<BranchResponse[]>(this.base);
  }

  getById(id: string): Observable<BranchResponse> {
    return this.http.get<BranchResponse>(`${this.base}/${id}`);
  }

  create(data: CreateBranchRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>(this.base, data);
  }

  update(id: string, data: UpdateBranchRequest): Observable<void> {
    return this.http.put<void>(`${this.base}/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  getAvailableBranches(): Observable<BranchResponse[]> {
    return this.http.get<BranchResponse[]>(`${this.base}/available`);
  }
}
