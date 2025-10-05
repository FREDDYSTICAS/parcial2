import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { useCreateObservacion } from '../../hooks/useApi';
import type { Empleado } from '../../types';

interface ObservacionModalProps {
  isOpen: boolean;
  onClose: () => void;
  empleado: Empleado;
}

const ObservacionModal: React.FC<ObservacionModalProps> = ({ isOpen, onClose, empleado }) => {
  const [formData, setFormData] = useState({
    tipo: 'llamado_atencion' as 'llamado_atencion' | 'felicitacion' | 'advertencia' | 'otro',
    descripcion: '',
    autor: ''
  });

  const createObservacion = useCreateObservacion();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.descripcion.trim() || !formData.autor.trim()) {
      return;
    }

    try {
      await createObservacion.mutateAsync({
        id: empleado._id!,
        data: formData
      });
      
      setFormData({
        tipo: 'llamado_atencion' as 'llamado_atencion' | 'felicitacion' | 'advertencia' | 'otro',
        descripcion: '',
        autor: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Error al crear observación:', error);
    }
  };

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'llamado_atencion':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'felicitacion':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'advertencia':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getTipoLabel = (tipo: string) => {
    switch (tipo) {
      case 'llamado_atencion':
        return 'Llamado de Atención';
      case 'felicitacion':
        return 'Felicitación';
      case 'advertencia':
        return 'Advertencia';
      case 'otro':
        return 'Otro';
      default:
        return tipo;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
        
        <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-amber-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Nueva Observación</h2>
                <p className="text-sm text-gray-500">
                  {empleado.nombre} {empleado.apellido}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Tipo de observación */}
            <div className="space-y-2">
              <label htmlFor="tipo" className="block text-sm font-medium text-gray-700">
                Tipo de Observación
              </label>
              <select
                id="tipo"
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
              >
                <option value="llamado_atencion">Llamado de Atención</option>
                <option value="felicitacion">Felicitación</option>
                <option value="advertencia">Advertencia</option>
                <option value="otro">Otro</option>
              </select>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700">
                Descripción
              </label>
              <textarea
                id="descripcion"
                name="descripcion"
                rows={4}
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe la observación..."
                className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors resize-none"
                required
              />
            </div>

            {/* Autor */}
            <div className="space-y-2">
              <label htmlFor="autor" className="block text-sm font-medium text-gray-700">
                Autor
              </label>
              <input
                type="text"
                id="autor"
                name="autor"
                value={formData.autor}
                onChange={handleChange}
                placeholder="Nombre del autor"
                className="block w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-colors"
                required
              />
            </div>

            {/* Preview */}
            {formData.descripcion && formData.autor && (
              <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-medium text-gray-700">Vista previa:</h4>
                <div className="flex items-start space-x-3">
                  {getTipoIcon(formData.tipo)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        {getTipoLabel(formData.tipo)}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date().toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-900">{formData.descripcion}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Por: {formData.autor}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!formData.descripcion.trim() || !formData.autor.trim() || createObservacion.isPending}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"
              >
                {createObservacion.isPending ? 'Guardando...' : 'Guardar Observación'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ObservacionModal;
