import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  RoleResponse,
  RoleDetailResponse,
  CreateRoleRequest,
  UpdateRoleRequest,
  AssignRolePermissionsRequest
} from '../models/role.models';

@Injectable({ providedIn: 'root' })
export class RoleService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/roles`;

  getAll() {
    return this.http.get<RoleResponse[]>(this.base);
  }

  getById(id: string) {
    return this.http.get<RoleDetailResponse>(`${this.base}/${id}`);
  }

  create(data: CreateRoleRequest) {
    return this.http.post<{ id: string }>(this.base, data);
  }

  update(id: string, data: UpdateRoleRequest) {
    return this.http.put(`${this.base}/${id}`, data);
  }

  delete(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }

  assignPermissions(id: string, data: AssignRolePermissionsRequest) {
    return this.http.put(`${this.base}/${id}/permisos`, data);
  }
}
