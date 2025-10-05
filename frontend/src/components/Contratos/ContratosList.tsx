import React, { useState } from 'react';
import { useContratos, useDeleteContrato } from '../../hooks/useApi';
import { Plus, Eye, Edit, Trash2, FileText, Mail, Table } from 'lucide-react';
import Button from '../UI/Button';
import Select from '../UI/Select';
import Badge from '../UI/Badge';
import ContratoModal from './ContratoModal';
import ContratoDetails from './ContratoDetails';
import EmailModal from '../UI/EmailModal';
import api from '../../services/api';
import { formatDate, formatCurrency } from '../../utils/notifications';
import type { Contrato } from '../../types';

const ContratosList: React.FC = () => {
  const [filters, setFilters] = useState({
    estado: '',
    tipo_contrato: '',
    empleado_id: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [selectedContrato, setSelectedContrato] = useState<Contrato | null>(null);
  const [editingContrato, setEditingContrato] = useState<(Contrato & { _id: string }) | null>(null);
  const [isGenerating, setIsGenerating] = useState<'pdf' | 'excel' | null>(null);

  const { data: contratos, isLoading, error } = useContratos(filters);
  const deleteContratoMutation = useDeleteContrato();

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewDetails = (contrato: Contrato) => {
    setSelectedContrato(contrato);
    setShowDetails(true);
  };

  const handleEdit = (contrato: Contrato) => {
    if (contrato._id) {
      setEditingContrato(contrato as Contrato & { _id: string });
      setShowModal(true);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres marcar este contrato como terminado?')) {
      await deleteContratoMutation.mutateAsync(id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingContrato(null);
  };

  const handleDownloadPDF = async () => {
    setIsGenerating('pdf');
    try {
      const response = await api.get('/contratos/export/pdf', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contratos_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando PDF:', error);
    } finally {
      setIsGenerating(null);
    }
  };

  const handleDownloadExcel = async () => {
    setIsGenerating('excel');
    try {
      const response = await api.get('/contratos/export/excel', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `contratos_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error descargando Excel:', error);
    } finally {
      setIsGenerating(null);
    }
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      activo: 'success',
      vencido: 'danger',
      terminado: 'default'
    } as const;
    
    return (
      <Badge variant={variants[estado as keyof typeof variants] || 'default'}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  const getTipoBadge = (tipo: string) => {
    const variants = {
      indefinido: 'success',
      temporal: 'warning',
      prestacion_servicios: 'info'
    } as const;
    
    return (
      <Badge variant={variants[tipo as keyof typeof variants] || 'default'}>
        {tipo.replace('_', ' ').charAt(0).toUpperCase() + tipo.replace('_', ' ').slice(1)}
      </Badge>
    );
  };

  const isContratoProximoVencer = (fechaFin: string) => {
    const hoy = new Date();
    const fin = new Date(fechaFin);
    const diasRestantes = Math.ceil((fin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 30 && diasRestantes > 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error cargando contratos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Contratos</h1>
          <p className="text-gray-600">Gestiona los contratos laborales del molino</p>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 sm:mt-0">
          {/* Botones de reportes */}
          <Button
            onClick={handleDownloadPDF}
            loading={isGenerating === 'pdf'}
            disabled={isGenerating !== null}
            className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white"
          >
            <FileText className="h-4 w-4" />
            <span>PDF</span>
          </Button>
          
          <Button
            onClick={handleDownloadExcel}
            loading={isGenerating === 'excel'}
            disabled={isGenerating !== null}
            className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
          >
            <Table className="h-4 w-4" />
            <span>Excel</span>
          </Button>
          
          <Button
            onClick={() => setShowEmailModal(true)}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Mail className="h-4 w-4" />
            <span>Email</span>
          </Button>
          
          {/* Botón Nuevo Contrato */}
          <Button onClick={() => setShowModal(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Contrato
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Select
            placeholder="Todos los estados"
            value={filters.estado}
            onChange={(e) => handleFilterChange('estado', e.target.value)}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'activo', label: 'Activo' },
              { value: 'vencido', label: 'Vencido' },
              { value: 'terminado', label: 'Terminado' }
            ]}
          />
          
          <Select
            placeholder="Todos los tipos"
            value={filters.tipo_contrato}
            onChange={(e) => handleFilterChange('tipo_contrato', e.target.value)}
            options={[
              { value: '', label: 'Todos los tipos' },
              { value: 'indefinido', label: 'Indefinido' },
              { value: 'temporal', label: 'Temporal' },
              { value: 'prestacion_servicios', label: 'Prestación de Servicios' }
            ]}
          />
        </div>
      </div>

      {/* Lista de contratos */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contrato
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Período
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Valor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {contratos?.map((contrato) => (
                <tr key={contrato._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {contrato.empleado_nombre}
                        </div>
                        <div className="text-sm text-gray-500">
                          {contrato.empleado_documento}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{contrato.cargo}</div>
                    <div className="text-sm text-gray-500">
                      {getTipoBadge(contrato.tipo_contrato)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatDate(contrato.fecha_inicio)} - {formatDate(contrato.fecha_fin)}
                    </div>
                    {isContratoProximoVencer(contrato.fecha_fin) && contrato.estado === 'activo' && (
                      <div className="text-xs text-red-600 font-medium">
                        Próximo a vencer
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {formatCurrency(contrato.valor_contrato)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEstadoBadge(contrato.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(contrato)}
                        className="text-amber-600 hover:text-amber-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(contrato)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contrato._id!)}
                        className="text-red-600 hover:text-red-900"
                        title="Eliminar"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {contratos?.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay contratos</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.estado || filters.tipo_contrato
                ? 'No se encontraron contratos con los filtros aplicados.'
                : 'Comienza agregando un nuevo contrato.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modales */}
      <ContratoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        contrato={editingContrato}
      />

      <ContratoDetails
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        contrato={selectedContrato}
        onEdit={handleEdit}
      />
      
      {/* Modal de envío por email */}
      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        fileName="contratos"
        fileType="pdf"
      />
    </div>
  );
};

export default ContratosList;
