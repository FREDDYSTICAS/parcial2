import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { 
  User, 
  LogOut, 
  Menu, 
  X,
  Building2,
  Users,
  FileText,
  BarChart3
} from 'lucide-react';
import { useState } from 'react';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard', href: '/', icon: BarChart3 },
    { name: 'Empleados', href: '/empleados', icon: Users },
    { name: 'Contratos', href: '/contratos', icon: FileText },
  ];

  return (
    <header className="bg-gradient-to-r from-amber-600 to-amber-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y título */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Building2 className="h-8 w-8 text-white" />
              <span className="text-white text-xl font-bold">
                SIRH Molino
              </span>
            </Link>
          </div>

          {/* Navegación desktop */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-white hover:text-amber-200 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Usuario y menú */}
          <div className="flex items-center space-x-4">
            {/* Información del usuario */}
            <div className="hidden md:flex items-center space-x-2 text-white">
              <User className="h-5 w-5" />
              <span className="text-sm font-medium">{user?.username}</span>
              <span className="text-xs text-amber-200">({user?.rol})</span>
            </div>

            {/* Botón de logout */}
            <button
              onClick={handleLogout}
              className="text-white hover:text-amber-200 p-2 rounded-md transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="h-5 w-5" />
            </button>

            {/* Menú móvil */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white hover:text-amber-200 p-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Menú móvil desplegable */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-amber-600 rounded-b-lg">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="text-white hover:text-amber-200 block px-3 py-2 rounded-md text-base font-medium transition-colors"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="flex items-center space-x-2">
                      <Icon className="h-4 w-4" />
                      <span>{item.name}</span>
                    </div>
                  </Link>
                );
              })}
              <div className="border-t border-amber-500 pt-2 mt-2">
                <div className="flex items-center space-x-2 px-3 py-2 text-sm text-amber-200">
                  <User className="h-4 w-4" />
                  <span>{user?.username} ({user?.rol})</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
