import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Eye, EyeOff, Mail, Lock, ArrowRight, Building2, Users, FileText } from 'lucide-react';
import '../styles/login-v2.css';

const LoginV2: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isVisible, setIsVisible] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  // Animación de entrada
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Limpiar error al escribir
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      console.log('🚀 Iniciando proceso de login...');
      await login(formData.email, formData.password);
      console.log('✅ Login completado, navegando a dashboard...');
      navigate('/');
      console.log('🎯 Navegación ejecutada');
    } catch (err: any) {
      console.error('❌ Error en login:', err);
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Funcionalidad de recuperación de contraseña próximamente disponible');
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Imagen de fondo con overlay */}
      <div className="absolute inset-0 z-0">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/80 via-orange-800/70 to-yellow-900/80" />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      {/* Contenido principal */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-2 sm:p-4">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-center">
          
          {/* Panel izquierdo - Información del sistema */}
          <div className={`text-white space-y-4 sm:space-y-6 lg:space-y-8 transform transition-all duration-1000 ${
            isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'
          } animate-slide-in-left order-2 lg:order-1`}>
            <div className="space-y-3 sm:space-y-4 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start space-x-3">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-500 rounded-xl flex items-center justify-center">
                  <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold">SIRH Molino</h1>
              </div>
              <p className="text-lg sm:text-xl text-amber-100 font-medium">Sistema Integrado de Recursos Humanos</p>
              <p className="text-sm sm:text-base lg:text-lg text-amber-200">
                Gestiona eficientemente el talento humano de tu molino de arroz
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <Users className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 mb-2" />
                <h3 className="font-semibold text-amber-100 text-sm sm:text-base">Empleados</h3>
                <p className="text-xs sm:text-sm text-amber-200">Gestión completa del personal</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20">
                <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 mb-2" />
                <h3 className="font-semibold text-amber-100 text-sm sm:text-base">Contratos</h3>
                <p className="text-xs sm:text-sm text-amber-200">Administración de contratos</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/20 sm:col-span-2 lg:col-span-1">
                <Building2 className="w-6 h-6 sm:w-8 sm:h-8 text-amber-400 mb-2" />
                <h3 className="font-semibold text-amber-100 text-sm sm:text-base">Organización</h3>
                <p className="text-xs sm:text-sm text-amber-200">Estructura organizacional</p>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm rounded-xl p-4 sm:p-6 border border-amber-400/30">
              <h3 className="text-base sm:text-lg font-semibold text-amber-100 mb-2">¿Nuevo en el sistema?</h3>
              <p className="text-amber-200 text-xs sm:text-sm">
                Contacta al administrador para obtener tus credenciales de acceso
              </p>
            </div>
          </div>

          {/* Panel derecho - Formulario de login */}
          <div className={`transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
          } animate-slide-in-right order-1 lg:order-2`}>
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/20 p-4 sm:p-6 lg:p-8 xl:p-10">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 animate-pulse-glow">
                  <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">Iniciar Sesión</h2>
                <p className="text-sm sm:text-base text-gray-600">Accede a tu cuenta para continuar</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                {/* Campo Email */}
                <div className="space-y-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-3 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white/80 backdrop-blur-sm input-focus text-sm sm:text-base"
                      placeholder="tu@email.com"
                    />
                  </div>
                </div>

                {/* Campo Password */}
                <div className="space-y-2">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    Contraseña
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className="block w-full pl-10 pr-12 py-2.5 sm:py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all duration-200 bg-white/80 backdrop-blur-sm input-focus text-sm sm:text-base"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      ) : (
                        <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Enlace de recuperación de contraseña */}
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={handleForgotPassword}
                    className="text-sm text-amber-600 hover:text-amber-700 font-medium transition-colors duration-200"
                  >
                    ¿Olvidaste tu contraseña?
                  </button>
                </div>

                {/* Mensaje de error */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {/* Botón de login */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex items-center justify-center px-4 py-2.5 sm:py-3 border border-transparent rounded-xl shadow-sm text-sm sm:text-base font-medium text-white btn-gradient hover-lift focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Iniciar Sesión</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </button>
              </form>

              {/* Footer del formulario */}
              <div className="mt-8 text-center">
                <p className="text-xs text-gray-500">
                  © 2024 SIRH Molino de Arroz. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Efectos de partículas flotantes */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-amber-300/30 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default LoginV2;
