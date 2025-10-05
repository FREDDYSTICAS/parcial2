import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import multer from 'multer';
import path from 'path';

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
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB máximo
  fileFilter: (req, file, cb) => {
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
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/api/health', async (req, res) => {
  try {
    const { db } = await import('./services/couchdb');
    // Verificar Firestore buscando un usuario (o al menos la colección)
    const result = await db.find({ selector: { type: 'usuario' }, limit: 1 });

    res.json({
      status: 'OK',
      message: 'SIRH Molino de Arroz API',
      timestamp: new Date().toISOString(),
      database: {
        provider: 'firebase-firestore',
        reachable: true,
        hasUsers: result.docs.length > 0
      }
    });
  } catch (err: any) {
    res.status(200).json({
      status: 'DEGRADED',
      message: 'API responde, base de datos no alcanzable',
      timestamp: new Date().toISOString(),
      database: {
        provider: 'firebase-firestore',
        reachable: false,
        error: err?.message
      }
    });
  }
});

// Rutas de la API
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

    const { sendEmail } = await import('./services/emailService');

    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    const isPDF = fileExtension === 'pdf';
    const isExcel = ['xlsx', 'xls'].includes(fileExtension || '');

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
      message: 'Archivo enviado correctamente'
    });

  } catch (error) {
    console.error('Error enviando archivo por email:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
});

// Servir archivos estáticos del frontend
app.use(express.static(path.join(__dirname, '../../frontend/dist')));

// Ruta para SPA (Single Page Application) - debe ir al final
// Usar RegExp compatible con Express 5 para evitar errores de path-to-regexp
app.get(/^\/(?!api).*/, (req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend/dist/index.html'));
});

// Middleware de manejo de errores (debe ir al final)
app.use(notFound);
app.use(errorHandler);

// Inicializar servidor
const startServer = async () => {
  try {
    // Inicializar base de datos (Firebase en lugar de CouchDB)
    const { initializeDatabase } = await import('./services/firebase');
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Servidor SIRH Molino corriendo en puerto ${PORT}`);
      console.log(`📊 API disponible en http://localhost:${PORT}/api`);
      console.log(`🏥 Health check en http://localhost:${PORT}/api/health`);
      console.log(`🌐 Frontend disponible en http://localhost:${PORT}`);
    });

  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
};

startServer();