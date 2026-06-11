import { RolResponse } from "../../roles/models/rol.models";

export interface UsuarioResponse {
  id: string;
  nombre: string;
  nombreUsuario: string;
  fotoPerfil: string | null;
  email: string | null;
  nombreRol: string;
}

export interface UsuarioDetalleResponse {
  id: string;
  nombre: string;
  nombreUsuario: string;
  fotoPerfil: string | null;
  telefono: string | null;
  email: string | null;
  rolId: string;
}

export interface CrearUsuarioRequest {
  nombre: string;
  nombreUsuario: string;
  password: string;
  fotoPerfil: string | null;
  email: string | null;
  telefono: string | null;
  rolId: string;
}

export interface EditarUsuarioRequest {
  id: string;
  nombre: string;
  nombreUsuario: string;
  fotoPerfil: string | null;
  email: string | null;
  telefono: string | null;
  rolId: string;
}
