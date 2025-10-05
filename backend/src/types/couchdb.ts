// Interfaces para documentos de CouchDB

export interface BaseDocument {
  _id: string;
  _rev?: string;
  type: string;
  fecha_creacion: string;
  fecha_actualizacion?: string;
}

export interface Empleado extends BaseDocument {
  type: 'empleado';
  nro_documento: string;
  nombre: string;
  apellido: string;
  nombre_apellido?: string; // Campo derivado para búsquedas y ordenación
  edad: number;
  genero: 'Masculino' | 'Femenino' | 'Otro';
  cargo: string;
  correo: string;
  nro_contacto: string;
  estado: 'activo' | 'inactivo' | 'suspendido';
  observaciones: Observacion[];
}

export interface Observacion {
  fecha: string;
  tipo: 'llamado_atencion' | 'felicitacion' | 'advertencia' | 'otro';
  descripcion: string;
  autor: string;
}

export interface Contrato extends BaseDocument {
  type: 'contrato';
  empleado_id: string;
  empleado_nombre: string;
  empleado_documento: string;
  fecha_inicio: string;
  fecha_fin: string;
  valor_contrato: number;
  cargo: string;
  tipo_contrato: 'indefinido' | 'temporal' | 'prestacion_servicios';
  estado: 'activo' | 'terminado' | 'vencido';
}

export interface Usuario extends BaseDocument {
  type: 'usuario';
  username: string;
  email: string;
  password_hash: string;
  rol: 'administrador' | 'supervisor' | 'usuario';
  empleado_id: string;
  activo: boolean;
  reset_token?: string;
  reset_token_expires?: string;
}

// Tipos para respuestas de CouchDB
export interface CouchDBResponse {
  ok: boolean;
  id: string;
  rev: string;
}

export interface CouchDBViewResponse<T = any> {
  rows: Array<{
    id: string;
    key: string;
    value: any;
    doc?: T;
  }>;
}

export interface CouchDBFindResponse<T = any> {
  docs: T[];
  bookmark?: string;
  warning?: string;
}

// Tipos para configuración de CouchDB
export interface CouchDBConfig {
  url: string;
  username?: string;
  password?: string;
}
