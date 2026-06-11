export interface RolResponse {
  id: string;
  nombre: string;
}

export interface RolDetalleResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
  permisos: PermisoResponse[];
}

export interface PermisoResponse {
  id: string;
  nombre: string;
  descripcion: string | null;
}

export interface CrearRolRequest {
  nombre: string;
  descripcion: string | null;
}

export interface EditarRolRequest {
  nombre: string;
  descripcion: string | null;
}

export interface AsignarPermisosRequest {
  permisosIds: string[];
}
