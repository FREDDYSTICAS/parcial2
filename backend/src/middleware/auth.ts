import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extender la interfaz Request para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        username: string;
        rol: string;
      };
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  console.log('=== MIDDLEWARE DE AUTENTICACIÓN ===');
  console.log('Timestamp:', new Date().toISOString());
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', JSON.stringify(req.headers, null, 2));

  const authHeader = req.headers['authorization'];
  console.log('Authorization header:', authHeader);
  
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
  console.log('Token extraído:', token ? `${token.substring(0, 20)}...` : 'No encontrado');

  if (!token) {
    console.log('❌ Token no encontrado en headers');
    return res.status(401).json({
      success: false,
      error: 'Token de acceso requerido'
    });
  }

  const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
  console.log('JWT Secret configurado:', !!jwtSecret);

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) {
      console.log('❌ Error verificando token:');
      console.log('- Tipo de error:', err.name);
      console.log('- Mensaje:', err.message);
      console.log('- Token expirado:', err.name === 'TokenExpiredError');
      console.log('- Token malformado:', err.name === 'JsonWebTokenError');
      return res.status(403).json({
        success: false,
        error: 'Token inválido o expirado'
      });
    }

    console.log('✅ Token válido, decodificando...');
    console.log('Datos del usuario decodificados:', JSON.stringify(decoded, null, 2));
    
    req.user = decoded as any;
    console.log('✅ Usuario autenticado correctamente');
    console.log('=== FIN MIDDLEWARE DE AUTENTICACIÓN ===');
    return next();
  });
};

// Middleware para verificar roles
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Usuario no autenticado'
      });
    }

    if (!roles.includes(req.user.rol)) {
      return res.status(403).json({
        success: false,
        error: 'Permisos insuficientes'
      });
    }

    return next();
  };
};

// Middleware para verificar si es administrador
export const requireAdmin = requireRole(['administrador']);

// Middleware para verificar si es supervisor o administrador
export const requireSupervisor = requireRole(['administrador', 'supervisor']);
