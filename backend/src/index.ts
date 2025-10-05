// Configurar variables de entorno PRIMERO
import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';

// Importar rutas
import authRoutes from './routes/auth';
import empleadosRoutes from './routes/empleados';
import contratosRoutes from './routes/contratos';

// Importar middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();
const PORT = process.env.PORT || 3000;

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
      console.log(`👤 Usuario: admin`);
      console.log(`🔑 Contraseña: admin123`);
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
