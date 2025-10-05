// Tipos principales del sistema SIRH Molino

export interface Empleado {
  _id?: string;
  _rev?: string;
  type: 'empleado';
  nro_documento: string;
  nombre: string;
  apellido: string;
  edad: number;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  cargo: string;
  correo: string;
  nro_contacto: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  observaciones?: Observacion[];
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface Observacion {
  fecha: string;
  tipo: 'llamado_atencion' | 'felicitacion' | 'advertencia' | 'otro';
  descripcion: string;
  autor: string;
}

export interface Contrato {
  _id?: string;
  _rev?: string;
  type: 'contrato';
  empleado_id: string;
  empleado_nombre: string;
  empleado_documento: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
  cargo: string;
  tipo_contrato: 'indefinido' | 'temporal' | 'prestacion_servicios';
  estado: 'activo' | 'vencido' | 'terminado';
  fecha_creacion: string;
}

export interface Usuario {
  _id?: string;
  _rev?: string;
  type: 'usuario';
  username: string;
  email: string;
  password_hash: string;
  rol: 'administrador' | 'supervisor' | 'usuario';
  empleado_id?: string;
  activo: boolean;
  fecha_creacion: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    email: string;
    rol: string;
    empleado_id?: string;
  };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Tipos para formularios
export interface EmpleadoFormData {
  nro_documento: string;
  nombre: string;
  apellido: string;
  edad: number;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  cargo: string;
  correo: string;
  nro_contacto: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
}

export interface ContratoFormData {
  empleado_id: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
  cargo: string;
  tipo_contrato: 'indefinido' | 'temporal' | 'prestacion_servicios';
  estado: 'activo' | 'vencido' | 'terminado';
}

// Tipos para filtros y búsquedas
export interface EmpleadoFilters {
  estado?: string;
  cargo?: string;
  genero?: string;
  search?: string;
}

export interface ContratoFilters {
  estado?: string;
  tipo_contrato?: string;
  empleado_id?: string;
}

// Tipos para estadísticas
export interface EstadisticasEmpleados {
  total: number;
  activos: number;
  inactivos: number;
  por_cargo: Record<string, number>;
  por_genero: Record<string, number>;
  por_edad: {
    '18-25': number;
    '26-35': number;
    '36-45': number;
    '46-55': number;
    '55+': number;
  };
}

export interface EstadisticasContratos {
  total: number;
  activos: number;
  vencidos: number;
  terminados: number;
  proximos_vencer: number;
  valor_total: number;
}
