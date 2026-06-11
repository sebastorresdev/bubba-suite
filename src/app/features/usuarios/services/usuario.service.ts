import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { UsuarioResponse, CrearUsuarioRequest, EditarUsuarioRequest, UsuarioDetalleResponse } from '../models/usuario.models';

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/usuarios`;

  obtenerTodos() {
    return this.http.get<UsuarioResponse[]>(this.base);
  }

  obtenerPorId(id: string) {
    return this.http.get<UsuarioDetalleResponse>(`${this.base}/${id}`);
  }

  crear(data: CrearUsuarioRequest) {
    return this.http.post<{ id: string }>(this.base, data);
  }

  editar(id: string, data: EditarUsuarioRequest) {
    return this.http.put(`${this.base}/${id}`, data);
  }

  eliminar(id: string) {
    return this.http.delete(`${this.base}/${id}`);
  }

  archivar(id: string) {
    return this.http.patch(`${this.base}/${id}/archivar`, {});
  }
  subirFoto(formData: FormData) {
    return this.http.post<{ url: string }>(`${this.base}/foto`, formData);
    // No pongas Content-Type — el navegador lo asigna automáticamente
    // con el boundary correcto para multipart/form-data
  }
}
