// Tipos para el contexto de autenticación

export interface User {
  id: string;
  username: string;
  email: string;
  rol: string;
  empleado_id?: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}
