import React from 'react';
import { 
  useEmpleadosStats, 
  useContratosStats, 
  useEmpleados, 
  useContratos 
} from '../hooks/useApi';
import { 
  Users, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';

const Dashboard: React.FC = () => {
  // Consultas para estadísticas
  const { data: statsEmpleados, isLoading: loadingEmpleados } = useEmpleadosStats();
  const { data: statsContratos, isLoading: loadingContratos } = useContratosStats();
  const { isLoading: loadingEmpleadosList } = useEmpleados({ estado: 'activo' });
  const { data: contratos, isLoading: loadingContratosList } = useContratos({ estado: 'activo' });

  const isLoading = loadingEmpleados || loadingContratos || loadingEmpleadosList || loadingContratosList;

  // Calcular contratos próximos a vencer (30 días)
  const contratosProximosVencer = contratos?.filter(contrato => {
    const fechaFin = new Date(contrato.fecha_fin);
    const hoy = new Date();
    const diasRestantes = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
    return diasRestantes <= 30 && diasRestantes > 0;
  }) || [];

  const statsCards = [
    {
      title: 'Total Empleados',
      value: statsEmpleados?.total || 0,
      icon: Users,
      color: 'bg-blue-500',
      change: '+12%',
      changeType: 'positive' as const,
    },
    {
      title: 'Empleados Activos',
      value: statsEmpleados?.activos || 0,
      icon: TrendingUp,
      color: 'bg-green-500',
      change: '+5%',
      changeType: 'positive' as const,
    },
    {
      title: 'Contratos Activos',
      value: statsContratos?.activos || 0,
      icon: FileText,
      color: 'bg-amber-500',
      change: '+8%',
      changeType: 'positive' as const,
    },
    {
      title: 'Próximos a Vencer',
      value: contratosProximosVencer.length,
      icon: AlertTriangle,
      color: 'bg-red-500',
      change: 'Urgente',
      changeType: 'negative' as const,
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-3">
          <Building2 className="h-8 w-8 text-amber-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard SIRH Molino
            </h1>
            <p className="text-gray-600">
              Sistema de Información de Recursos Humanos - Molino de Arroz "El Grano Dorado"
            </p>
          </div>
        </div>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center">
                <div className={`p-3 rounded-full ${card.color}`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{card.value}</p>
                </div>
              </div>
              <div className="mt-4">
                <span
                  className={`text-sm font-medium ${
                    card.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                  }`}
                >
                  {card.change}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs mes anterior</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Gráficos y tablas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Distribución por cargo */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución por Cargo
          </h3>
          {statsEmpleados?.por_cargo ? (
            <div className="space-y-3">
              {Object.entries(statsEmpleados.por_cargo).map(([cargo, cantidad]) => (
                <div key={cargo} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{cargo}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{
                          width: `${(cantidad / (statsEmpleados.total || 1)) * 100}%`
                        }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{cantidad}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay datos disponibles</p>
          )}
        </div>

        {/* Contratos próximos a vencer */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Contratos Próximos a Vencer
          </h3>
          {contratosProximosVencer.length > 0 ? (
            <div className="space-y-3">
              {contratosProximosVencer.slice(0, 5).map((contrato) => {
                const fechaFin = new Date(contrato.fecha_fin);
                const hoy = new Date();
                const diasRestantes = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
                
                return (
                  <div key={contrato._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {contrato.empleado_nombre}
                      </p>
                      <p className="text-xs text-gray-600">{contrato.cargo}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-red-600">
                        {diasRestantes} días
                      </p>
                      <p className="text-xs text-gray-500">
                        {fechaFin.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">No hay contratos próximos a vencer</p>
          )}
        </div>
      </div>

      {/* Resumen financiero */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Resumen Financiero
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <DollarSign className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              ${statsContratos?.valor_total?.toLocaleString() || 0}
            </p>
            <p className="text-sm text-gray-600">Valor Total Contratos</p>
          </div>
          <div className="text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              {statsContratos?.activos || 0}
            </p>
            <p className="text-sm text-gray-600">Contratos Activos</p>
          </div>
          <div className="text-center">
            <TrendingUp className="h-8 w-8 text-amber-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900">
              ${statsContratos?.valor_total ? Math.round(statsContratos.valor_total / (statsContratos.activos || 1)) : 0}
            </p>
            <p className="text-sm text-gray-600">Promedio por Contrato</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
