import React, { useState } from 'react';
import { Download, Mail, FileText, Table } from 'lucide-react';
import EmpleadosList from '../components/Empleados/EmpleadosList';
import EmailModal from '../components/UI/EmailModal';
import Button from '../components/UI/Button';
import api from '../services/api';

const Empleados: React.FC = () => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState<'pdf' | 'excel' | null>(null);

  const handleDownloadPDF = async () => {
    setIsGenerating('pdf');
    try {
      const response = await api.get('/empleados/export/pdf', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `empleados_${new Date().toISOString().split('T')[0]}.pdf`);
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
      const response = await api.get('/empleados/export/excel', {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `empleados_${new Date().toISOString().split('T')[0]}.xlsx`);
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header con botones de reportes */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
              <p className="mt-1 text-sm text-gray-500">
                Gestiona la información de los empleados del molino
              </p>
            </div>
            
            {/* Botones de reportes */}
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-3">
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
                <span>Enviar por Email</span>
              </Button>
            </div>
          </div>
        </div>

        <EmpleadosList />
        
        {/* Modal de envío por email */}
        <EmailModal
          isOpen={showEmailModal}
          onClose={() => setShowEmailModal(false)}
          fileName="empleados"
          fileType="pdf"
        />
      </div>
    </div>
  );
};

export default Empleados;
