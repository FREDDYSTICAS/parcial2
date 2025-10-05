import React from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import { 
  User, 
  Mail, 
  Phone, 
  Edit, 
  X,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';
import { formatDate } from '../../utils/notifications';
import type { Empleado } from '../../types';

interface EmpleadoDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  empleado: Empleado | null;
  onEdit: (empleado: Empleado) => void;
}

const EmpleadoDetails: React.FC<EmpleadoDetailsProps> = ({
  isOpen,
  onClose,
  empleado,
  onEdit
}) => {
  if (!empleado) return null;

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactivo':
        return <X className="h-4 w-4 text-red-600" />;
      case 'suspendido':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getObservacionColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'success';
      case 'inactivo':
        return 'danger';
      case 'suspendido':
        return 'warning';
      default:
        return 'default';
    }
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${empleado.nombre} ${empleado.apellido}`}
      size="xl"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Información Principal */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-amber-100 flex items-center justify-center">
                <User className="h-10 w-10 text-amber-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {empleado.nombre} {empleado.apellido}
                </h2>
                <Badge variant={getObservacionColor(empleado.estado)}>
                  {getEstadoIcon(empleado.estado)}
                  <span className="ml-1">{empleado.estado.charAt(0).toUpperCase() + empleado.estado.slice(1)}</span>
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">Documento: {empleado.nro_documento}</p>
              <p className="text-gray-600">{empleado.cargo}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onEdit(empleado);
                onClose();
              }}
            >
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </Button>
          </div>
        </div>

        {/* Información Detallada */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Información Personal */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-amber-600" />
              Información Personal
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Edad:</span>
                <span className="font-medium">{empleado.edad} años</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Género:</span>
                <span className="font-medium">{empleado.genero}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha de Creación:</span>
                <span className="font-medium">{formatDate(empleado.fecha_creacion)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Última Actualización:</span>
                <span className="font-medium">{formatDate(empleado.fecha_actualizacion)}</span>
              </div>
            </div>
          </div>

          {/* Información de Contacto */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Mail className="h-5 w-5 mr-2 text-amber-600" />
              Información de Contacto
            </h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{empleado.correo}</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-gray-900">{empleado.nro_contacto}</span>
              </div>
            </div>
          </div>
        </div>


        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <Button
            variant="secondary"
            onClick={onClose}
          >
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EmpleadoDetails;
