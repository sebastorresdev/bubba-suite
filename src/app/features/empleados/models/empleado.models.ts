export enum DocumentType {
  DNI = 0,
  RUC = 1,
  CE = 2,
  PASAPORTE = 3
}

export const DocumentTypeLabels = [
  { label: 'DNI', value: DocumentType.DNI },
  { label: 'RUC', value: DocumentType.RUC },
  { label: 'C.E. (Carnet Extranjería)', value: DocumentType.CE },
  { label: 'Pasaporte', value: DocumentType.PASAPORTE }
];

export interface Empleado {
  id: string;
  code: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  email?: string | null;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  hireDate?: string | null;
  photoUrl?: string | null;
  isActive: boolean;
}

export interface EmpleadoDetail extends Empleado {}

export interface CreateEmpleadoRequest {
  code: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  email: string | null;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  hireDate?: string | null;
  photoUrl?: string | null;
}

export interface UpdateEmpleadoRequest {
  code: string;
  firstName: string;
  lastName: string;
  documentType: DocumentType;
  documentNumber: string;
  email: string | null;
  phone?: string | null;
  position?: string | null;
  department?: string | null;
  hireDate?: string | null;
  photoUrl?: string | null;
  isActive: boolean;
}

