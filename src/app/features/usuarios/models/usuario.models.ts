export interface UsuarioResponse {
  id: string;
  nombre: string;
  nombreUsuario: string;
  fotoPerfil: string | null;
  email: string | null;
  nombreRol: string;
  activo: boolean;
}

export interface UsuarioDetalleResponse {
  id: string;
  nombre: string;
  nombreUsuario: string;
  fotoPerfil: string | null;
  telefono: string | null;
  email: string | null;
  rolId: string;
  activo: boolean;
}

export interface CrearUsuarioRequest {
  nombre: string;
  nombreUsuario: string;
  password: string;
  fotoPerfil: string | null;
  email: string | null;
  telefono: string | null;
  rolId: string;
  activo: boolean;
}

export interface EditarUsuarioRequest {
  id: string;
  nombre: string;
  nombreUsuario: string;
  fotoPerfil: string | null;
  email: string | null;
  telefono: string | null;
  rolId: string;
  activo: boolean;
}
