import React, { useState } from 'react';
import { useEmpleados, useDeleteEmpleado } from '../../hooks/useApi';
import { Search, Plus, Eye, Edit, Trash2, User } from 'lucide-react';
import Button from '../UI/Button';
import Input from '../UI/Input';
import Select from '../UI/Select';
import Badge from '../UI/Badge';
import EmpleadoModal from './EmpleadoModal';
import EmpleadoDetails from './EmpleadoDetails';
import { formatDate } from '../../utils/notifications';

const EmpleadosList: React.FC = () => {
  const [filters, setFilters] = useState({
    search: '',
    estado: '',
    cargo: '',
    genero: ''
  });
  const [showModal, setShowModal] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedEmpleado, setSelectedEmpleado] = useState<any>(null);
  const [editingEmpleado, setEditingEmpleado] = useState<any>(null);

  const { data: empleados, isLoading, error } = useEmpleados(filters);
  const deleteEmpleadoMutation = useDeleteEmpleado();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleViewDetails = (empleado: any) => {
    setSelectedEmpleado(empleado);
    setShowDetails(true);
  };

  const handleEdit = (empleado: any) => {
    setEditingEmpleado(empleado);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres marcar este empleado como inactivo?')) {
      await deleteEmpleadoMutation.mutateAsync(id);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEmpleado(null);
  };

  const getEstadoBadge = (estado: string) => {
    const variants = {
      activo: 'success',
      inactivo: 'danger',
      suspendido: 'warning'
    } as const;
    
    return (
      <Badge variant={variants[estado as keyof typeof variants] || 'default'}>
        {estado.charAt(0).toUpperCase() + estado.slice(1)}
      </Badge>
    );
  };

  const cargos = [
    'Gerente General',
    'Gerente de Producción',
    'Supervisor de Producción',
    'Operador de Molino',
    'Técnico de Mantenimiento',
    'Contador',
    'Auxiliar Administrativo'
  ];

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
        <p className="text-red-600">Error cargando empleados</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
          <p className="text-gray-600">Gestiona la información de los empleados del molino</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="mt-4 sm:mt-0">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Empleado
        </Button>
      </div>

      {/* Filtros */}
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Input
            placeholder="Buscar por nombre o documento..."
            value={filters.search}
            onChange={handleSearch}
            leftIcon={<Search className="h-4 w-4" />}
          />
          
          <Select
            placeholder="Todos los estados"
            value={filters.estado}
            onChange={(e) => handleFilterChange('estado', e.target.value)}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'activo', label: 'Activo' },
              { value: 'inactivo', label: 'Inactivo' },
              { value: 'suspendido', label: 'Suspendido' }
            ]}
          />
          
          <Select
            placeholder="Todos los cargos"
            value={filters.cargo}
            onChange={(e) => handleFilterChange('cargo', e.target.value)}
            options={[
              { value: '', label: 'Todos los cargos' },
              ...cargos.map(cargo => ({ value: cargo, label: cargo }))
            ]}
          />
          
          <Select
            placeholder="Todos los géneros"
            value={filters.genero}
            onChange={(e) => handleFilterChange('genero', e.target.value)}
            options={[
              { value: '', label: 'Todos los géneros' },
              { value: 'Masculino', label: 'Masculino' },
              { value: 'Femenino', label: 'Femenino' },
              { value: 'Otro', label: 'Otro' }
            ]}
          />
        </div>
      </div>

      {/* Lista de empleados */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Empleado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cargo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Fecha Creación
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {empleados?.map((empleado) => (
                <tr key={empleado._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-amber-100 flex items-center justify-center">
                          <User className="h-5 w-5 text-amber-600" />
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {empleado.nombre} {empleado.apellido}
                        </div>
                        <div className="text-sm text-gray-500">
                          {empleado.nro_documento}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{empleado.cargo}</div>
                    <div className="text-sm text-gray-500">{empleado.correo}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getEstadoBadge(empleado.estado)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(empleado.fecha_creacion)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(empleado)}
                        className="text-amber-600 hover:text-amber-900"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(empleado)}
                        className="text-blue-600 hover:text-blue-900"
                        title="Editar"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(empleado._id!)}
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

        {empleados?.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay empleados</h3>
            <p className="mt-1 text-sm text-gray-500">
              {filters.search || filters.estado || filters.cargo || filters.genero
                ? 'No se encontraron empleados con los filtros aplicados.'
                : 'Comienza agregando un nuevo empleado.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Modales */}
      <EmpleadoModal
        isOpen={showModal}
        onClose={handleCloseModal}
        empleado={editingEmpleado}
      />

      <EmpleadoDetails
        isOpen={showDetails}
        onClose={() => setShowDetails(false)}
        empleado={selectedEmpleado}
        onEdit={handleEdit}
      />
    </div>
  );
};

export default EmpleadosList;
