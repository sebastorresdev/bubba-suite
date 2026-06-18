import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UserResponse, CreateUserRequest, UpdateUserRequest, UserDetailResponse } from '../models/user.models';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/users`;

  getAll() {
    return this.http.get<UserResponse[]>(this.base);
  }

  getById(id: string) {
    return this.http.get<UserDetailResponse>(`${this.base}/${id}`);
  }

  create(data: CreateUserRequest) {
    return this.http.post<{ id: string }>(this.base, data);
  }

  update(id: string, data: UpdateUserRequest) {
    return this.http.put(`${this.base}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }

  archive(id: string) {
    return this.http.patch(`${this.base}/${id}/archivar`, {});
  }

  uploadPhoto(formData: FormData) {
    return this.http.post<{ url: string }>(`${this.base}/foto`, formData);
  }

  updateUserStatus(id: string, isActive: boolean) {
    return this.http.patch(`${this.base}/${id}/status`, { isActive });
  }
}
