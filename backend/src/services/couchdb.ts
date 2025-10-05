import nano from 'nano';
import dotenv from 'dotenv';
import { CouchDBConfig } from '../types/couchdb';

// Cargar variables de entorno
dotenv.config();

const couchdbUsername = process.env.COUCHDB_USERNAME || 'freddysticas';
const couchdbPassword = process.env.COUCHDB_PASSWORD || '12345678';
const databaseName = process.env.COUCHDB_DATABASE || 'sirh_molino';

// Configurar conexión a CouchDB (igual que el script que funciona)
const couchdbUrl = `http://${encodeURIComponent(couchdbUsername)}:${encodeURIComponent(couchdbPassword)}@127.0.0.1:5984`;

// Configuración de CouchDB
console.log(`🔗 Conectando a CouchDB: ${couchdbUrl}`);
console.log(`📊 Base de datos: ${databaseName}`);

const couchdbConfig: CouchDBConfig = {
  url: couchdbUrl
};

const couchdb = nano(couchdbConfig);

// Obtener instancia de la base de datos (se configurará dinámicamente)
let db = couchdb.db.use(databaseName);

// Función para inicializar la base de datos
export const initializeDatabase = async () => {
  try {
    console.log('=== INICIALIZANDO BASE DE DATOS ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('CouchDB URL:', couchdbUrl);
    console.log('Database Name:', databaseName);
    console.log('Username:', couchdbUsername);
    console.log('Password configurada:', !!couchdbPassword);

    // Verificar que la base de datos existe y es accesible
    try {
      console.log('🔍 Verificando acceso a la base de datos...');
      const dbInfo = await db.info();
      console.log('📊 Información de la base de datos:');
      console.log('- Nombre:', dbInfo.db_name);
      console.log('- Documentos:', dbInfo.doc_count);
      console.log('- Tamaño:', dbInfo.sizes?.file);
      console.log('- Actualización secuencial:', dbInfo.update_seq);
      console.log(`✅ Base de datos ${databaseName} existe y es accesible`);
    } catch (accessError: any) {
      console.error('❌ Error accediendo a la base de datos:');
      console.error('- Status Code:', accessError.statusCode);
      console.error('- Error:', accessError.message);
      console.error('- Error completo:', JSON.stringify(accessError, null, 2));
      throw new Error(`La base de datos '${databaseName}' no existe o no es accesible. Por favor, créala manualmente en CouchDB.`);
    }
    
    console.log(`✅ Conectado a CouchDB: ${databaseName}`);
    
    // Crear vistas si no existen
    console.log('🔧 Creando/actualizando vistas...');
    await createViews();
    console.log('=== BASE DE DATOS INICIALIZADA ===');
    
  } catch (error: any) {
    console.error('💥 ERROR INICIALIZANDO BASE DE DATOS:');
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Error completo:', JSON.stringify(error, null, 2));
    throw error;
  }
};

// Función para crear vistas MapReduce
const createViews = async () => {
  try {
    console.log('🔧 Creando documento de diseño con vistas...');
    
    const designDoc = {
      _id: '_design/views',
      views: {
        // Vista para empleados por documento
        empleados_por_documento: {
          map: `function(doc) {
            if (doc.type === 'empleado') {
              emit(doc.nro_documento, doc);
            }
          }`
        },
        // Vista para empleados por nombre
        empleados_por_nombre: {
          map: `function(doc) {
            if (doc.type === 'empleado') {
              emit(doc.nombre + ' ' + doc.apellido, doc);
            }
          }`
        },
        // Vista para contratos por empleado
        contratos_por_empleado: {
          map: `function(doc) {
            if (doc.type === 'contrato') {
              emit(doc.empleado_id, doc);
            }
          }`
        },
        // Vista para usuarios del sistema por username
        usuarios_sistema: {
          map: `function(doc) {
            if (doc.type === 'usuario') {
              emit(doc.username, doc);
            }
          }`
        },
        // Vista para usuarios del sistema por email
        usuarios_por_email: {
          map: `function(doc) {
            if (doc.type === 'usuario') {
              emit(doc.email, doc);
            }
          }`
        },
        // Vista para estadísticas
        estadisticas_empleados: {
          map: `function(doc) {
            if (doc.type === 'empleado') {
              emit(doc.estado, 1);
            }
          }`,
          reduce: `function(keys, values) {
            return sum(values);
          }`
        }
      }
    };

    console.log('📋 Documento de diseño preparado:');
    console.log('- ID:', designDoc._id);
    console.log('- Vistas definidas:', Object.keys(designDoc.views));

    // Intentar crear o actualizar el documento de diseño
    try {
      console.log('💾 Intentando crear documento de diseño...');
      const result = await db.insert(designDoc);
      console.log('✅ Vistas creadas correctamente');
      console.log('- ID del documento:', result.id);
      console.log('- Revisión:', result.rev);
    } catch (error: any) {
      console.log('⚠️ Error al crear documento de diseño:');
      console.log('- Status Code:', error.statusCode);
      console.log('- Error:', error.message);
      
      if (error.statusCode === 409) {
        console.log('🔄 El documento ya existe, actualizándolo...');
        // El documento ya existe, actualizarlo
        const existingDoc = await db.get('_design/views') as any;
        console.log('📄 Documento existente encontrado:');
        console.log('- Revisión actual:', existingDoc._rev);
        console.log('- Vistas existentes:', Object.keys(existingDoc.views || {}));
        
        (designDoc as any)._rev = existingDoc._rev;
        const updateResult = await db.insert(designDoc);
        console.log('✅ Vistas actualizadas correctamente');
        console.log('- Nueva revisión:', updateResult.rev);
      } else {
        console.error('💥 Error inesperado creando vistas:');
        console.error('- Error completo:', JSON.stringify(error, null, 2));
        throw error;
      }
    }
  } catch (error: any) {
    console.error('💥 ERROR CREANDO VISTAS:');
    console.error('Tipo de error:', error.constructor.name);
    console.error('Mensaje:', error.message);
    console.error('Stack trace:', error.stack);
    console.error('Error completo:', JSON.stringify(error, null, 2));
    throw error;
  }
};

// Exportar la instancia de la base de datos
export { db };

export default couchdb;
