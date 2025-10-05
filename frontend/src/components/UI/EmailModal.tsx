import React, { useState, useRef } from 'react';
import { Mail, FileText, Send, AlertCircle, CheckCircle } from 'lucide-react';
import Button from './Button';
import Input from './Input';
import Modal from './Modal';
import api from '../../services/api';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  fileName?: string;
  fileType?: 'pdf' | 'excel';
}

const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  fileName = '',
  fileType = 'pdf'
}) => {
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      // Validar tipo de archivo
      const allowedTypes = [
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel'
      ];
      
      if (!allowedTypes.includes(selectedFile.type)) {
        setError('Solo se permiten archivos PDF y Excel');
        return;
      }
      
      // Validar tamaño (10MB máximo)
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('El archivo no puede ser mayor a 10MB');
        return;
      }
      
      setFile(selectedFile);
      setError('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !file) {
      setError('Email y archivo son requeridos');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('email', email);
      formData.append('file', file);
      formData.append('subject', subject || `Archivo SIRH Molino - ${file.name}`);
      formData.append('message', message);

      await api.post('/send-file-email', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      setIsSuccess(true);
    } catch (err: unknown) {
      console.error('❌ Error enviando archivo:', err);
      const errorMessage = err && typeof err === 'object' && 'response' in err && 
        err.response && typeof err.response === 'object' && 'data' in err.response &&
        err.response.data && typeof err.response.data === 'object' && 'error' in err.response.data
        ? (err.response.data as { error: string }).error
        : 'Error al enviar archivo por email';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setSubject('');
    setMessage('');
    setFile(null);
    setError('');
    setIsSuccess(false);
    onClose();
  };

  const getFileIcon = () => {
    if (file) {
      const extension = file.name.split('.').pop()?.toLowerCase();
      return extension === 'pdf' ? '📄' : '📊';
    }
    return fileType === 'pdf' ? '📄' : '📊';
  };

  if (isSuccess) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} title="¡Archivo enviado!" size="md">
        <div className="text-center py-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Email enviado exitosamente
          </h3>
          
          <p className="text-gray-600 mb-6">
            El archivo ha sido enviado a <strong>{email}</strong>
          </p>
          
          <Button onClick={handleClose} className="w-full">
            Cerrar
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Enviar archivo por email" size="md">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <Input
          label="Correo electrónico"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="destinatario@email.com"
          leftIcon={<Mail className="h-4 w-4" />}
          required
          disabled={isLoading}
        />

        {/* Asunto */}
        <Input
          label="Asunto (opcional)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder={`Archivo SIRH Molino - ${fileName || 'documento'}`}
          disabled={isLoading}
        />

        {/* Mensaje */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mensaje (opcional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Escribe un mensaje personalizado..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 disabled:bg-gray-50 disabled:text-gray-500"
            rows={3}
            disabled={isLoading}
          />
        </div>

        {/* Carga de archivo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Archivo a enviar
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-amber-400 transition-colors">
            <div className="space-y-1 text-center">
              <div className="text-4xl mb-2">{getFileIcon()}</div>
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="file-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-amber-600 hover:text-amber-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-amber-500"
                >
                  <span>Seleccionar archivo</span>
                  <input
                    ref={fileInputRef}
                    id="file-upload"
                    name="file-upload"
                    type="file"
                    className="sr-only"
                    accept=".pdf,.xlsx,.xls"
                    onChange={handleFileChange}
                    disabled={isLoading}
                  />
                </label>
                <p className="pl-1">o arrastra y suelta aquí</p>
              </div>
              <p className="text-xs text-gray-500">
                PDF, Excel hasta 10MB
              </p>
            </div>
          </div>
          
          {file && (
            <div className="mt-2 flex items-center space-x-2 text-sm text-gray-600">
              <FileText className="h-4 w-4" />
              <span>{file.name}</span>
              <span className="text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-600" />
              <p className="text-red-800 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Botones */}
        <div className="flex justify-end space-x-3 pt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            loading={isLoading}
            disabled={isLoading || !email || !file}
            className="flex items-center space-x-2"
          >
            <Send className="h-4 w-4" />
            <span>Enviar</span>
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default EmailModal;
