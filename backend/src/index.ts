// Configurar variables de entorno PRIMERO
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import multer from 'multer';

// Importar rutas
import authRoutes from './routes/auth';
import empleadosRoutes from './routes/empleados';
import contratosRoutes from './routes/contratos';

// Importar middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();
const PORT = process.env.PORT || 3000;

// Configurar multer para archivos
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Permitir PDF y Excel
    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos PDF y Excel'));
    }
  }
});

// Middleware de seguridad
app.use(helmet());
app.use(compression());

// Middleware de CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Middleware para parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/contratos', contratosRoutes);

// Endpoint para envío de archivos por email
app.post('/api/send-file-email', upload.single('file'), async (req, res) => {
  try {
    const { email, subject, message } = req.body;
    const file = req.file;

    if (!email || !file) {
      return res.status(400).json({
        success: false,
        error: 'Email y archivo son requeridos'
      });
    }

    // Importar servicio de email
    const { sendEmail } = await import('./services/emailService');

    // Determinar el tipo de archivo
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    const isPDF = fileExtension === 'pdf';
    const isExcel = ['xlsx', 'xls'].includes(fileExtension || '');

    // Crear HTML del email
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #D4AF37;">Archivo enviado desde SIRH Molino</h2>
        <p>Hola,</p>
        <p>Se ha enviado un archivo desde el Sistema de Información de Recursos Humanos del Molino de Arroz.</p>
        
        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Archivo:</strong> ${file.originalname}</p>
          <p><strong>Tipo:</strong> ${isPDF ? 'PDF' : isExcel ? 'Excel' : 'Documento'}</p>
          <p><strong>Tamaño:</strong> ${(file.size / 1024).toFixed(2)} KB</p>
        </div>
        
        ${message ? `<p><strong>Mensaje:</strong> ${message}</p>` : ''}
        
        <p>Este archivo fue generado automáticamente por el sistema SIRH Molino.</p>
        <p>Saludos,<br>Equipo SIRH Molino de Arroz</p>
      </div>
    `;

    // Enviar email con archivo adjunto
    await sendEmail({
      to: email,
      subject: subject || `Archivo SIRH Molino - ${file.originalname}`,
      html,
      attachments: [{
        filename: file.originalname,
        content: file.buffer,
        contentType: file.mimetype
      }]
    });

    res.json({
      success: true,
      message: 'Archivo enviado por email exitosamente'
    });

  } catch (error) {
    console.error('Error enviando archivo por email:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'SIRH Molino de Arroz API',
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores
app.use(notFound);
app.use(errorHandler);

// Inicializar base de datos y servidor
const startServer = async () => {
  try {
    console.log('=== INICIANDO SERVIDOR SIRH MOLINO ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Node Environment:', process.env.NODE_ENV || 'development');
    console.log('Port:', PORT);
    console.log('Frontend URL:', process.env.FRONTEND_URL || 'http://localhost:5173');
    
    // Inicializar CouchDB
    console.log('🔗 Inicializando conexión a CouchDB...');
    const { initializeDatabase } = await import('./services/couchdb');
    await initializeDatabase();
    console.log('✅ CouchDB inicializado correctamente');
    
    // Seeding de datos (solo en desarrollo)
    if (process.env.NODE_ENV !== 'production') {
      console.log('🌱 Iniciando seeding de datos...');
      try {
        const { seedDatabase } = await import('./scripts/seedData');
        await seedDatabase();
        console.log('✅ Seeding completado');
      } catch (error: any) {
        console.log('⚠️ Error en seeding (continuando):');
        console.error('- Error:', error);
        console.error('- Stack:', error.stack);
      }
    } else {
      console.log('🚫 Seeding omitido (modo producción)');
    }
    
    // Iniciar servidor
    console.log('🚀 Iniciando servidor HTTP...');
    app.listen(PORT, () => {
      console.log('=== SERVIDOR INICIADO EXITOSAMENTE ===');
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}/api`);
      console.log(`🏥 Health check en http://localhost:${PORT}/api/health`);
      console.log(`\n🔐 Credenciales de prueba:`);
      console.log(`📧 Email: cfreddystiven@gmail.com`);
      console.log(`🔑 Contraseña: 12345678`);
      console.log('=== LISTO PARA RECIBIR PETICIONES ===');
    });
  } catch (error: any) {
    console.error('💥 ERROR INICIANDO SERVIDOR:');
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Error completo:', JSON.stringify(error, null, 2));
    console.log('=== SERVIDOR FALLÓ AL INICIAR ===');
    process.exit(1);
  }
};

startServer();

export default app;
