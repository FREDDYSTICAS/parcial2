import React from 'react';
import Modal from '../UI/Modal';
import Button from '../UI/Button';
import Badge from '../UI/Badge';
import { 
  FileText, 
  Calendar, 
  DollarSign, 
  User, 
  Edit,
  CheckCircle,
  X,
  Clock
} from 'lucide-react';
import { formatDate, formatCurrency } from '../../utils/notifications';
import type { Contrato } from '../../types';

interface ContratoDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  contrato: Contrato | null;
  onEdit: (contrato: Contrato) => void;
}

const ContratoDetails: React.FC<ContratoDetailsProps> = ({
  isOpen,
  onClose,
  contrato,
  onEdit
}) => {
  if (!contrato) return null;

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'activo':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'vencido':
        return <X className="h-4 w-4 text-red-600" />;
      case 'terminado':
        return <Clock className="h-4 w-4 text-gray-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo':
        return 'success';
      case 'vencido':
        return 'danger';
      case 'terminado':
        return 'default';
      default:
        return 'default';
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'indefinido':
        return 'success';
      case 'temporal':
        return 'warning';
      case 'prestacion_servicios':
        return 'info';
      default:
        return 'default';
    }
  };

  const isContratoProximoVencer = (fechaFin: string) => {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diasRestantes = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 30 && diasRestantes > 0;
  };

  const diasRestantes = () => {
    const hoy = new Date();
    const fin = new Date(contrato.fecha_fin);
    return Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Contrato - ${contrato.empleado_nombre}`}
      size="xl"
    >
      <div className="space-y-6">
        {/* Información Principal */}
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center">
                <FileText className="h-10 w-10 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-3">
                <h2 className="text-2xl font-bold text-gray-900">
                  {contrato.empleado_nombre}
                </h2>
                <Badge variant={getEstadoColor(contrato.estado)}>
                  {getEstadoIcon(contrato.estado)}
                  <span className="ml-1">{contrato.estado.charAt(0).toUpperCase() + contrato.estado.slice(1)}</span>
                </Badge>
              </div>
              <p className="text-gray-600 mt-1">Documento: {contrato.empleado_documento}</p>
              <p className="text-gray-600">{contrato.cargo}</p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                onEdit(contrato);
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
          {/* Información del Empleado */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <User className="h-5 w-5 mr-2 text-amber-600" />
              Información del Empleado
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Nombre:</span>
                <span className="font-medium">{contrato.empleado_nombre}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Documento:</span>
                <span className="font-medium">{contrato.empleado_documento}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cargo:</span>
                <span className="font-medium">{contrato.cargo}</span>
              </div>
            </div>
          </div>

          {/* Información del Contrato */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <FileText className="h-5 w-5 mr-2 text-amber-600" />
              Información del Contrato
            </h3>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Tipo:</span>
                <Badge variant={getTipoColor(contrato.tipo_contrato)}>
                  {contrato.tipo_contrato.replace('_', ' ').charAt(0).toUpperCase() + contrato.tipo_contrato.replace('_', ' ').slice(1)}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Estado:</span>
                <Badge variant={getEstadoColor(contrato.estado)}>
                  {getEstadoIcon(contrato.estado)}
                  <span className="ml-1">{contrato.estado.charAt(0).toUpperCase() + contrato.estado.slice(1)}</span>
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fecha de Creación:</span>
                <span className="font-medium">{formatDate(contrato.fecha_creacion)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Período y Valor */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-amber-600" />
            Período y Valor
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-gray-900">Fecha de Inicio</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(contrato.fecha_inicio)}
              </p>
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Calendar className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-gray-900">Fecha de Fin</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(contrato.fecha_fin)}
              </p>
              {isContratoProximoVencer(contrato.fecha_fin) && contrato.estado === 'activo' && (
                <p className="text-sm text-red-600 font-medium mt-1">
                  {diasRestantes()} días restantes
                </p>
              )}
            </div>
            
            <div className="bg-white border rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <DollarSign className="h-4 w-4 text-amber-600" />
                <span className="text-sm font-medium text-gray-900">Valor del Contrato</span>
              </div>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(contrato.valor_contrato)}
              </p>
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

export default ContratoDetails;
