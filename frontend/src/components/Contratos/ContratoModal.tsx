import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useCreateContrato, useUpdateContrato, useEmpleados } from '../../hooks/useApi';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import { FileText, Calendar, DollarSign, User } from 'lucide-react';
import type { Contrato } from '../../types';

const contratoSchema = z.object({
  empleado_id: z.string().min(1, 'Empleado es requerido'),
  fecha_inicio: z.string().min(1, 'Fecha de inicio es requerida'),
  fecha_fin: z.string().min(1, 'Fecha de fin es requerida'),
  valor_contrato: z.number().min(0, 'El valor debe ser mayor a 0'),
  tipo_contrato: z.enum(['indefinido', 'temporal', 'prestacion_servicios']),
  cargo: z.string(),
  estado: z.enum(['activo', 'vencido', 'terminado'])
}).refine((data) => {
  const inicio = new Date(data.fecha_inicio);
  const fin = new Date(data.fecha_fin);
  return fin > inicio;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['fecha_fin']
});

type ContratoFormData = z.infer<typeof contratoSchema>;

type ContratoForModal = Contrato & { _id: string };

interface ContratoModalProps {
  isOpen: boolean;
  onClose: () => void;
  contrato?: ContratoForModal | null;
}

const ContratoModal: React.FC<ContratoModalProps> = ({
  isOpen,
  onClose,
  contrato
}) => {
  const isEditing = !!contrato;
  const createMutation = useCreateContrato();
  const updateMutation = useUpdateContrato();
  const { data: empleados } = useEmpleados({ estado: 'activo' });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<ContratoFormData>({
    resolver: zodResolver(contratoSchema),
    defaultValues: {
      empleado_id: '',
      fecha_inicio: '',
      fecha_fin: '',
      valor_contrato: 0,
      tipo_contrato: 'indefinido',
      cargo: '',
      estado: 'activo'
    }
  });

  const selectedEmpleadoId = watch('empleado_id');
  const selectedEmpleado = empleados?.find(emp => emp._id === selectedEmpleadoId);

  useEffect(() => {
    if (isOpen) {
      if (contrato) {
        reset({
          empleado_id: contrato.empleado_id,
          fecha_inicio: contrato.fecha_inicio,
          fecha_fin: contrato.fecha_fin,
          valor_contrato: contrato.valor_contrato,
          tipo_contrato: contrato.tipo_contrato,
          cargo: contrato.cargo,
          estado: contrato.estado
        });
      } else {
        reset({
          empleado_id: '',
          fecha_inicio: '',
          fecha_fin: '',
          valor_contrato: 0,
          tipo_contrato: 'indefinido',
          cargo: '',
          estado: 'activo'
        });
      }
    }
  }, [isOpen, contrato, reset]);

  const onSubmit = async (data: ContratoFormData) => {
    try {
      if (isEditing) {
        if (contrato._id) {
          await updateMutation.mutateAsync({
            id: contrato._id,
            data
          });
        }
      } else {
        await createMutation.mutateAsync(data);
      }
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const empleadoOptions = empleados?.map(emp => ({
    value: emp._id!,
    label: `${emp.nombre} ${emp.apellido} - ${emp.cargo}`
  })) || [];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? 'Editar Contrato' : 'Nuevo Contrato'}
      size="lg"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Información del Empleado */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <User className="h-5 w-5 mr-2 text-amber-600" />
            Información del Empleado
          </h3>
          
          <Select
            label="Empleado"
            {...register('empleado_id')}
            error={errors.empleado_id?.message}
            options={empleadoOptions}
            placeholder="Seleccionar empleado"
          />
          
          {selectedEmpleado && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Documento:</span>
                  <span className="ml-2 font-medium">{selectedEmpleado.nro_documento}</span>
                </div>
                <div>
                  <span className="text-gray-600">Cargo actual:</span>
                  <span className="ml-2 font-medium">{selectedEmpleado.cargo}</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Información del Contrato */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-amber-600" />
            Información del Contrato
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Cargo en el Contrato"
              {...register('cargo')}
              error={errors.cargo?.message}
              placeholder={selectedEmpleado?.cargo || 'Cargo específico'}
              helpText="Cargo específico para este contrato"
            />
            
            <Select
              label="Tipo de Contrato"
              {...register('tipo_contrato')}
              error={errors.tipo_contrato?.message}
              options={[
                { value: 'indefinido', label: 'Indefinido' },
                { value: 'temporal', label: 'Temporal' },
                { value: 'prestacion_servicios', label: 'Prestación de Servicios' }
              ]}
            />
          </div>
        </div>

        {/* Período y Valor */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-amber-600" />
            Período y Valor
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Fecha de Inicio"
              type="date"
              {...register('fecha_inicio')}
              error={errors.fecha_inicio?.message}
            />
            
            <Input
              label="Fecha de Fin"
              type="date"
              {...register('fecha_fin')}
              error={errors.fecha_fin?.message}
            />
          </div>
          
          <Input
            label="Valor del Contrato"
            type="number"
            {...register('valor_contrato', { valueAsNumber: true })}
            error={errors.valor_contrato?.message}
            placeholder="2500000"
            leftIcon={<DollarSign className="h-4 w-4" />}
            helpText="Valor en pesos colombianos"
          />
        </div>

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
            {isEditing ? 'Actualizar' : 'Crear'} Contrato
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ContratoModal;
