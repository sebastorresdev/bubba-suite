import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import {
  RolResponse,
  RolDetalleResponse,
  CrearRolRequest,
  EditarRolRequest,
  AsignarPermisosRequest
} from '../models/rol.models';

@Injectable({ providedIn: 'root' })
export class RolService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/roles`;

  obtenerTodos() {
    return this.http.get<RolResponse[]>(this.base);
  }

  obtenerPorId(id: string) {
    return this.http.get<RolDetalleResponse>(`${this.base}/${id}`);
  }

  crear(data: CrearRolRequest) {
    return this.http.post<{ id: string }>(this.base, data);
  }

  editar(id: string, data: EditarRolRequest) {
    return this.http.put(`${this.base}/${id}`, data);
  }

  eliminar(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }

  asignarPermisos(id: string, data: AsignarPermisosRequest) {
    return this.http.put(`${this.base}/${id}/permisos`, data);
  }
}
