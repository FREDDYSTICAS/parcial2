import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { empleadosService, contratosService } from '../services/api';
import { notifications, handleApiError } from '../utils/notifications';
import type { 
  EmpleadoFormData, 
  ContratoFormData,
  EmpleadoFilters,
  ContratoFilters 
} from '../types';

// Hook para empleados
export const useEmpleados = (filters?: EmpleadoFilters) => {
  return useQuery({
    queryKey: ['empleados', filters],
    queryFn: () => empleadosService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useEmpleado = (id: string) => {
  return useQuery({
    queryKey: ['empleado', id],
    queryFn: () => empleadosService.getById(id),
    enabled: !!id,
  });
};

export const useCreateEmpleado = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (empleado: EmpleadoFormData) => empleadosService.create(empleado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      queryClient.invalidateQueries({ queryKey: ['empleados-stats'] });
      notifications.success('Éxito', 'Empleado creado correctamente');
    },
    onError: (error) => {
      notifications.error('Error', handleApiError(error));
    },
  });
};

export const useUpdateEmpleado = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: EmpleadoFormData }) => 
      empleadosService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      queryClient.invalidateQueries({ queryKey: ['empleado', id] });
      queryClient.invalidateQueries({ queryKey: ['empleados-stats'] });
      notifications.success('Éxito', 'Empleado actualizado correctamente');
    },
    onError: (error) => {
      notifications.error('Error', handleApiError(error));
    },
  });
};

export const useDeleteEmpleado = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => empleadosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['empleados'] });
      queryClient.invalidateQueries({ queryKey: ['empleados-stats'] });
      notifications.success('Éxito', 'Empleado eliminado correctamente');
    },
    onError: (error) => {
      notifications.error('Error', handleApiError(error));
    },
  });
};

export const useEmpleadosStats = () => {
  return useQuery({
    queryKey: ['empleados-stats'],
    queryFn: empleadosService.getEstadisticas,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

// Hook para contratos
export const useContratos = (filters?: ContratoFilters) => {
  return useQuery({
    queryKey: ['contratos', filters],
    queryFn: () => contratosService.getAll(filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useContrato = (id: string) => {
  return useQuery({
    queryKey: ['contrato', id],
    queryFn: () => contratosService.getById(id),
    enabled: !!id,
  });
};

export const useCreateContrato = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (contrato: ContratoFormData) => contratosService.create(contrato),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      queryClient.invalidateQueries({ queryKey: ['contratos-stats'] });
      notifications.success('Éxito', 'Contrato creado correctamente');
    },
    onError: (error) => {
      notifications.error('Error', handleApiError(error));
    },
  });
};

export const useUpdateContrato = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ContratoFormData }) => 
      contratosService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      queryClient.invalidateQueries({ queryKey: ['contrato', id] });
      queryClient.invalidateQueries({ queryKey: ['contratos-stats'] });
      notifications.success('Éxito', 'Contrato actualizado correctamente');
    },
    onError: (error) => {
      notifications.error('Error', handleApiError(error));
    },
  });
};

export const useDeleteContrato = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => contratosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contratos'] });
      queryClient.invalidateQueries({ queryKey: ['contratos-stats'] });
      notifications.success('Éxito', 'Contrato eliminado correctamente');
    },
    onError: (error) => {
      notifications.error('Error', handleApiError(error));
    },
  });
};

export const useContratosStats = () => {
  return useQuery({
    queryKey: ['contratos-stats'],
    queryFn: contratosService.getEstadisticas,
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
};

export const useContratosByEmpleado = (empleadoId: string) => {
  return useQuery({
    queryKey: ['contratos-empleado', empleadoId],
    queryFn: () => contratosService.getByEmpleado(empleadoId),
    enabled: !!empleadoId,
  });
};

// Hook para exportaciones
export const useExportEmpleados = () => {
  return useMutation({
    mutationFn: ({ format, filters }: { format: 'pdf' | 'excel'; filters?: EmpleadoFilters }) => {
      if (format === 'pdf') {
        return empleadosService.exportPDF(filters);
      }
      return empleadosService.exportExcel(filters);
    },
    onSuccess: (blob, { format }) => {
      const filename = `empleados_${new Date().toISOString().split('T')[0]}.${format}`;
      empleadosService.downloadFile(blob, filename);
      notifications.success('Éxito', `Archivo ${format.toUpperCase()} descargado correctamente`);
    },
    onError: (error) => {
      notifications.error('Error', handleApiError(error));
    },
  });
};

export const useExportContratos = () => {
  return useMutation({
    mutationFn: ({ format, filters }: { format: 'pdf' | 'excel'; filters?: ContratoFilters }) => {
      if (format === 'pdf') {
        return contratosService.exportPDF(filters);
      }
      return contratosService.exportExcel(filters);
    },
    onSuccess: (blob, { format }) => {
      const filename = `contratos_${new Date().toISOString().split('T')[0]}.${format}`;
      empleadosService.downloadFile(blob, filename);
      notifications.success('Éxito', `Archivo ${format.toUpperCase()} descargado correctamente`);
    },
    onError: (error) => {
      notifications.error('Error', handleApiError(error));
    },
  });
};
