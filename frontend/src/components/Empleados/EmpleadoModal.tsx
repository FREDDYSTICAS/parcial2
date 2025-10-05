import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateEmpleado, useUpdateEmpleado } from '../../hooks/useApi';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Badge from '../UI/Badge';
import ObservacionModal from './ObservacionModal';
import { User, Mail, Phone, Briefcase, AlertCircle, Plus, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { formatDateTime } from '../../utils/notifications';

const empleadoSchema = z.object({
  nro_documento: z.string().min(1, 'Número de documento es requerido'),
  nombre: z.string().min(1, 'Nombre es requerido'),
  apellido: z.string().min(1, 'Apellido es requerido'),
  edad: z.number().min(18, 'La edad mínima es 18 años').max(100, 'La edad máxima es 100 años'),
  genero: z.enum(['Masculino', 'Femenino', 'Otro']),
  cargo: z.string().min(1, 'Cargo es requerido'),
  correo: z.string().email('Correo electrónico inválido'),
  nro_contacto: z.string().min(1, 'Número de contacto es requerido'),
  estado: z.enum(['activo', 'inactivo', 'suspendido'])
});

type EmpleadoFormData = z.infer<typeof empleadoSchema>;

interface EmpleadoModalProps {
  isOpen: boolean;
  onClose: () => void;
  empleado?: any;
}

const EmpleadoModal: React.FC<EmpleadoModalProps> = ({
  isOpen,
  onClose,
  empleado
}) => {
  const isEditing = !!empleado;
  const createMutation = useCreateEmpleado();
  const updateMutation = useUpdateEmpleado();
  const [showObservacionModal, setShowObservacionModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<EmpleadoFormData>({
    resolver: zodResolver(empleadoSchema),
    defaultValues: {
      nro_documento: '',
      nombre: '',
      apellido: '',
      edad: 18,
      genero: 'Masculino',
      cargo: '',
      correo: '',
      nro_contacto: '',
      estado: 'activo'
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (empleado) {
        reset({
          nro_documento: empleado.nro_documento,
          nombre: empleado.nombre,
          apellido: empleado.apellido,
          edad: empleado.edad,
          genero: empleado.genero,
          cargo: empleado.cargo,
          correo: empleado.correo,
          nro_contacto: empleado.nro_contacto,
          estado: empleado.estado
        });
      } else {
        reset({
          nro_documento: '',
          nombre: '',
          apellido: '',
          edad: 18,
          genero: 'Masculino',
          cargo: '',
          correo: '',
          nro_contacto: '',
          estado: 'activo'
        });
      }
    }
  }, [isOpen, empleado, reset]);

  const onSubmit = async (data: EmpleadoFormData) => {
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: empleado._id,
          data
        });
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  // Funciones auxiliares para observaciones
  const getObservacionIcon = (tipo: string) => {
    switch (tipo) {
      case 'felicitacion':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'llamado_atencion':
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      case 'advertencia':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <Info className="h-5 w-5 text-blue-600" />;
    }
  };

  const getObservacionColor = (tipo: string) => {
    switch (tipo) {
      case 'felicitacion':
        return 'success';
      case 'llamado_atencion':
        return 'warning';
      case 'advertencia':
        return 'danger';
      default:
        return 'default';
    }
  };

  const cargos = [
    'Gerente General',
    'Gerente de Producción',
    'Gerente Administrativo',
    'Supervisor de Producción',
    'Supervisor de Calidad',
    'Operador de Molino',
    'Técnico de Mantenimiento',
    'Operador de Máquinas',
    'Contador',
    'Auxiliar Administrativo',
    'Asistente de Recursos Humanos',
    'Almacenista',
    'Conductor de Vehículos',
    'Auxiliar de Limpieza',
    'Vigilante'
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Empleado' : 'Nuevo Empleado'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-amber-600" />
              Información Personal
            </h3>
            
            <Input
              label="Número de Documento"
              {...register('nro_documento')}
              error={errors.nro_documento?.message}
              placeholder="12345678"
            />
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Nombre"
                {...register('nombre')}
                error={errors.nombre?.message}
                placeholder="Juan"
              />
              <Input
                label="Apellido"
                {...register('apellido')}
                error={errors.apellido?.message}
                placeholder="Pérez"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Edad"
                type="number"
                {...register('edad', { valueAsNumber: true })}
                error={errors.edad?.message}
                placeholder="25"
              />
              <Select
                label="Género"
                {...register('genero')}
                error={errors.genero?.message}
                options={[
                  { value: 'Masculino', label: 'Masculino' },
                  { value: 'Femenino', label: 'Femenino' },
                  { value: 'Otro', label: 'Otro' }
                ]}
              />
            </div>
          </div>

          {/* Información Laboral */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Briefcase className="h-5 w-5 mr-2 text-amber-600" />
              Información Laboral
            </h3>
            
            <Select
              label="Cargo"
              {...register('cargo')}
              error={errors.cargo?.message}
              options={cargos.map(cargo => ({ value: cargo, label: cargo }))}
              placeholder="Seleccionar cargo"
            />
            
            <Select
              label="Estado"
              {...register('estado')}
              error={errors.estado?.message}
              options={[
                { value: 'activo', label: 'Activo' },
                { value: 'inactivo', label: 'Inactivo' },
                { value: 'suspendido', label: 'Suspendido' }
              ]}
            />
          </div>
        </div>

        {/* Información de Contacto */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Mail className="h-5 w-5 mr-2 text-amber-600" />
            Información de Contacto
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Correo Electrónico"
              type="email"
              {...register('correo')}
              error={errors.correo?.message}
              placeholder="juan.perez@molino.com"
              leftIcon={<Mail className="h-4 w-4" />}
            />
            <Input
              label="Número de Contacto"
              {...register('nro_contacto')}
              error={errors.nro_contacto?.message}
              placeholder="3001234567"
              leftIcon={<Phone className="h-4 w-4" />}
            />
          </div>
        </div>

        {/* Sección de Observaciones - Solo al editar */}
        {isEditing && empleado && (
          <div className="space-y-4 bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900 flex items-center">
                <AlertCircle className="h-5 w-5 mr-2 text-amber-600" />
                Observaciones
              </h3>
              <Button
                type="button"
                onClick={() => setShowObservacionModal(true)}
                className="flex items-center space-x-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 text-sm font-medium"
              >
                <Plus className="h-4 w-4" />
                <span>Agregar Observación</span>
              </Button>
            </div>
            
            {empleado.observaciones && empleado.observaciones.length > 0 ? (
              <div className="space-y-3">
                {empleado.observaciones.map((obs: any, index: number) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-amber-200">
                    <div className="flex items-start space-x-3">
                      {getObservacionIcon(obs.tipo)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={getObservacionColor(obs.tipo)} size="sm">
                            {obs.tipo.replace('_', ' ').charAt(0).toUpperCase() + obs.tipo.replace('_', ' ').slice(1)}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(obs.fecha)}
                          </span>
                        </div>
                        <p className="text-gray-900">{obs.descripcion}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          Por: {obs.autor}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-600 bg-white rounded-lg border-2 border-dashed border-amber-300">
                <AlertCircle className="h-16 w-16 mx-auto mb-4 text-amber-400" />
                <p className="text-lg font-medium mb-2">No hay observaciones registradas</p>
                <p className="text-sm text-gray-500 mb-4">Haz clic en "Agregar Observación" para crear la primera observación</p>
                <div className="text-xs text-amber-600 bg-amber-100 px-3 py-1 rounded-full inline-block">
                  💡 Tip: Las observaciones pueden ser llamados de atención, felicitaciones, advertencias, etc.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
          >
            {isEditing ? 'Actualizar' : 'Crear'} Empleado
          </Button>
        </div>
      </form>

      {/* Modal de Observaciones */}
      {isEditing && empleado && (
        <ObservacionModal
          isOpen={showObservacionModal}
          onClose={() => setShowObservacionModal(false)}
          empleado={empleado}
        />
      )}
    </Modal>
  );
};

export default EmpleadoModal;
