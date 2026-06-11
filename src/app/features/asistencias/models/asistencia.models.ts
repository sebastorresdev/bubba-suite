export type EstadoAsistencia = 'PUNTUAL' | 'TARDANZA' | 'FALTA' | 'PERMISO';

export interface Asistencia {
  id: string;
  empleadoId: string;
  nombreEmpleado: string;
  fotoEmpleado?: string;
  rolEmpleado?: string;
  fecha: string; // YYYY-MM-DD
  horaEntrada?: string; // HH:mm:ss
  horaSalida?: string; // HH:mm:ss
  estado: EstadoAsistencia;
  observaciones?: string;
}

export interface ResumenAsistencia {
  totalEmpleados: number;
  activosHoy: number;
  tardanzasHoy: number;
  faltasHoy: number;
  porcentajePuntualidad: number;
}
