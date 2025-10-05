import axios from 'axios';
import type { 
  Empleado, 
  Contrato, 
  LoginRequest, 
  LoginResponse, 
  EmpleadoFormData, 
  ContratoFormData,
  EmpleadoFilters,
  ContratoFilters,
  EstadisticasEmpleados,
  EstadisticasContratos,
  Observacion
} from '../types';

// Configuración base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token de autenticación
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar respuestas de error
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Manejar errores de red
    if (!error.response) {
      console.error('Error de red:', error.message);
    }
    
    return Promise.reject(error);
  }
);

// Servicios de autenticación
export const authService = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    console.log('📡 Respuesta completa del servidor:', response.data);
    
    // El backend envía { success, message, data: { token, user } }
    // Necesitamos extraer data.token y data.user
    if (response.data.success && response.data.data) {
      return {
        token: response.data.data.token,
        user: response.data.data.user
      };
    }
    
    throw new Error('Respuesta de login inválida');
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  }
};

// Servicios de empleados
export const empleadosService = {
  // Obtener todos los empleados
  getAll: async (filters?: EmpleadoFilters): Promise<Empleado[]> => {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.cargo) params.append('cargo', filters.cargo);
    if (filters?.genero) params.append('genero', filters.genero);
    if (filters?.search) params.append('search', filters.search);

    console.log('📋 Obteniendo empleados con filtros:', filters);
    const response = await api.get(`/empleados?${params.toString()}`);
    console.log('📊 Respuesta de empleados:', response.data);
    
    // El backend devuelve { success: true, data: [...] }
    return response.data.success ? response.data.data : response.data;
  },

  // Obtener empleado por ID
  getById: async (id: string): Promise<Empleado> => {
    const response = await api.get(`/empleados/${id}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Crear empleado
  create: async (empleado: EmpleadoFormData): Promise<Empleado> => {
    const response = await api.post('/empleados', empleado);
    return response.data.success ? response.data.data : response.data;
  },

  // Actualizar empleado
  update: async (id: string, empleado: EmpleadoFormData): Promise<Empleado> => {
    const response = await api.put(`/empleados/${id}`, empleado);
    return response.data.success ? response.data.data : response.data;
  },

  // Eliminar empleado
  delete: async (id: string): Promise<void> => {
    await api.delete(`/empleados/${id}`);
  },

  // Agregar observación
  addObservacion: async (id: string, observacion: Omit<Observacion, 'fecha'>): Promise<Empleado> => {
    const response = await api.post(`/empleados/${id}/observaciones`, observacion);
    return response.data.success ? response.data.data : response.data;
  },

  // Obtener estadísticas
  getEstadisticas: async (): Promise<EstadisticasEmpleados> => {
    const response = await api.get('/empleados/estadisticas');
    return response.data.success ? response.data.data : response.data;
  },

  // Exportar a PDF
  exportPDF: async (filters?: EmpleadoFilters): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.cargo) params.append('cargo', filters.cargo);
    if (filters?.genero) params.append('genero', filters.genero);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/empleados/export/pdf?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Exportar a Excel
  exportExcel: async (filters?: EmpleadoFilters): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.cargo) params.append('cargo', filters.cargo);
    if (filters?.genero) params.append('genero', filters.genero);
    if (filters?.search) params.append('search', filters.search);

    const response = await api.get(`/empleados/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Descargar archivo
  downloadFile: (blob: Blob, filename: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
};

// Servicios de contratos
export const contratosService = {
  // Obtener todos los contratos
  getAll: async (filters?: ContratoFilters): Promise<Contrato[]> => {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.tipo_contrato) params.append('tipo_contrato', filters.tipo_contrato);
    if (filters?.empleado_id) params.append('empleado_id', filters.empleado_id);

    console.log('📄 Obteniendo contratos con filtros:', filters);
    const response = await api.get(`/contratos?${params.toString()}`);
    console.log('📊 Respuesta de contratos:', response.data);
    
    return response.data.success ? response.data.data : response.data;
  },

  // Obtener contrato por ID
  getById: async (id: string): Promise<Contrato> => {
    const response = await api.get(`/contratos/${id}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Crear contrato
  create: async (contrato: ContratoFormData): Promise<Contrato> => {
    const response = await api.post('/contratos', contrato);
    return response.data.success ? response.data.data : response.data;
  },

  // Actualizar contrato
  update: async (id: string, contrato: ContratoFormData): Promise<Contrato> => {
    const response = await api.put(`/contratos/${id}`, contrato);
    return response.data.success ? response.data.data : response.data;
  },

  // Eliminar contrato
  delete: async (id: string): Promise<void> => {
    await api.delete(`/contratos/${id}`);
  },

  // Obtener contratos por empleado
  getByEmpleado: async (empleadoId: string): Promise<Contrato[]> => {
    const response = await api.get(`/contratos/empleado/${empleadoId}`);
    return response.data.success ? response.data.data : response.data;
  },

  // Obtener estadísticas
  getEstadisticas: async (): Promise<EstadisticasContratos> => {
    const response = await api.get('/contratos/estadisticas');
    return response.data.success ? response.data.data : response.data;
  },

  // Exportar a PDF
  exportPDF: async (filters?: ContratoFilters): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.tipo_contrato) params.append('tipo_contrato', filters.tipo_contrato);
    if (filters?.empleado_id) params.append('empleado_id', filters.empleado_id);

    const response = await api.get(`/contratos/export/pdf?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Exportar a Excel
  exportExcel: async (filters?: ContratoFilters): Promise<Blob> => {
    const params = new URLSearchParams();
    if (filters?.estado) params.append('estado', filters.estado);
    if (filters?.tipo_contrato) params.append('tipo_contrato', filters.tipo_contrato);
    if (filters?.empleado_id) params.append('empleado_id', filters.empleado_id);

    const response = await api.get(`/contratos/export/excel?${params.toString()}`, {
      responseType: 'blob'
    });
    return response.data;
  }
};

export default api;
