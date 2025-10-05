import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../services/couchdb';
import { sendEmail } from '../services/emailService';
import { Usuario, Empleado } from '../types/couchdb';

// Interfaces
interface LoginRequest extends Request {
  body: {
    email: string;
    password: string;
  };
}

interface RegisterRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string;
    empleado_id: string;
  };
}

interface ForgotPasswordRequest extends Request {
  body: {
    email: string;
  };
}

interface ResetPasswordRequest extends Request {
  body: {
    token: string;
    password: string;
  };
}

// Login
export const login = async (req: LoginRequest, res: Response) => {
  try {
    console.log('=== INICIO LOGIN ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Headers:', JSON.stringify(req.headers, null, 2));

    const { email, password } = req.body;

    // Validar datos de entrada
    if (!email || !password) {
      console.log('❌ Datos de entrada faltantes:', { email: !!email, password: !!password });
      return res.status(400).json({
        success: false,
        error: 'Email y password son requeridos'
      });
    }

    console.log('🔍 Buscando usuario en la base de datos...');
    console.log('Email a buscar:', email);

    // Buscar usuario en la base de datos por email
    const result = await db.find({
      selector: {
        type: 'usuario',
        email: email
      },
      limit: 1
    });

    console.log('📊 Resultado de la búsqueda:');
    console.log('- Total de documentos encontrados:', result.docs.length);
    console.log('- Resultado completo:', JSON.stringify(result, null, 2));

    if (result.docs.length === 0) {
      console.log('❌ Usuario no encontrado en la base de datos');
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    const user = result.docs[0] as Usuario;
    console.log('👤 Usuario encontrado:');
    console.log('- ID:', user._id);
    console.log('- Username:', user.username);
    console.log('- Email:', user.email);
    console.log('- Rol:', user.rol);
    console.log('- Activo:', user.activo);
    console.log('- Empleado ID:', user.empleado_id);
    console.log('- Password hash existe:', !!user.password_hash);

    // Verificar contraseña
    console.log('🔐 Verificando contraseña...');
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    console.log('🔐 Resultado de verificación de contraseña:', isPasswordValid);

    if (!isPasswordValid) {
      console.log('❌ Contraseña incorrecta');
      return res.status(401).json({
        success: false,
        error: 'Credenciales inválidas'
      });
    }

    // Verificar si el usuario está activo
    console.log('✅ Verificando estado del usuario...');
    if (!user.activo) {
      console.log('❌ Usuario inactivo');
      return res.status(401).json({
        success: false,
        error: 'Usuario inactivo'
      });
    }

    console.log('🎫 Generando JWT...');
    const jwtSecret = process.env.JWT_SECRET || 'fallback_secret';
    const jwtExpiresIn = process.env.JWT_EXPIRES_IN || '24h';
    
    console.log('JWT Secret configurado:', !!jwtSecret);
    console.log('JWT Expires In:', jwtExpiresIn);

    // Generar JWT
    const token = jwt.sign(
      { 
        userId: user._id, 
        username: user.username,
        rol: user.rol 
      },
      jwtSecret,
      { expiresIn: jwtExpiresIn } as jwt.SignOptions
    );

    console.log('🎫 JWT generado exitosamente');
    console.log('Token (primeros 50 caracteres):', token.substring(0, 50) + '...');

    const responseData = {
      success: true,
      message: 'Login exitoso',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          rol: user.rol,
          empleado_id: user.empleado_id
        }
      }
    };

    console.log('✅ Login exitoso, enviando respuesta');
    console.log('=== FIN LOGIN ===');

    return res.json(responseData);

  } catch (error: any) {
    console.error('💥 ERROR EN LOGIN:');
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Error completo:', JSON.stringify(error, null, 2));
    console.log('=== FIN LOGIN CON ERROR ===');
    
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Registro (solo para administradores)
export const register = async (req: RegisterRequest, res: Response) => {
  try {
    const { username, email, password, empleado_id } = req.body;

    // Verificar si el usuario ya existe
    const existingUser = await db.view('views', 'usuarios_sistema', {
      key: username,
      include_docs: true
    });

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'El usuario ya existe'
      });
    }

    // Verificar si el empleado existe
    const empleado = await db.get(empleado_id) as Empleado;
    if (!empleado || empleado.type !== 'empleado') {
      return res.status(400).json({
        success: false,
        error: 'Empleado no encontrado'
      });
    }

    // Hash de la contraseña
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Crear usuario
    const newUser: Usuario = {
      _id: `user_${Date.now()}`,
      type: 'usuario',
      username,
      email,
      password_hash,
      rol: 'usuario',
      empleado_id,
      activo: true,
      fecha_creacion: new Date().toISOString()
    };

    const result = await db.insert(newUser);

    return res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: {
        id: result.id,
        username: newUser.username,
        email: newUser.email,
        rol: newUser.rol
      }
    });

  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Recuperación de contraseña
export const forgotPassword = async (req: ForgotPasswordRequest, res: Response) => {
  try {
    const { email } = req.body;

    // Buscar usuario por email
    const result = await db.find({
      selector: {
        type: 'usuario',
        email: email
      }
    });

    if (result.docs.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Usuario no encontrado'
      });
    }

    const user = result.docs[0] as Usuario;

    // Generar token de recuperación
    const resetToken = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET || 'fallback_secret',
      { expiresIn: '1h' }
    );

    // Guardar token en el usuario
    user.reset_token = resetToken;
    user.reset_token_expires = new Date(Date.now() + 3600000).toISOString(); // 1 hora
    await db.insert(user);

    // Enviar email
    await sendEmail({
      to: user.email,
      subject: 'Recuperación de contraseña - SIRH Molino',
      html: `
        <h2>Recuperación de contraseña</h2>
        <p>Hola ${user.username},</p>
        <p>Has solicitado recuperar tu contraseña. Haz clic en el siguiente enlace:</p>
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}">
          Recuperar contraseña
        </a>
        <p>Este enlace expira en 1 hora.</p>
        <p>Si no solicitaste este cambio, ignora este email.</p>
      `
    });

    return res.json({
      success: true,
      message: 'Email de recuperación enviado'
    });

  } catch (error) {
    console.error('Error en forgot password:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Reset de contraseña
export const resetPassword = async (req: ResetPasswordRequest, res: Response) => {
  try {
    const { token, password } = req.body;

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as any;
    
    // Buscar usuario
    const user = await db.get(decoded.userId) as Usuario;
    
    if (!user || user.type !== 'usuario') {
      return res.status(400).json({
        success: false,
        error: 'Token inválido'
      });
    }

    // Verificar si el token no ha expirado
    if (user.reset_token_expires && new Date() > new Date(user.reset_token_expires)) {
      return res.status(400).json({
        success: false,
        error: 'Token expirado'
      });
    }

    // Hash de la nueva contraseña
    const saltRounds = 12;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // Actualizar usuario
    user.password_hash = password_hash;
    delete user.reset_token;
    delete user.reset_token_expires;
    await db.insert(user);

    return res.json({
      success: true,
      message: 'Contraseña actualizada exitosamente'
    });

  } catch (error) {
    console.error('Error en reset password:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};
