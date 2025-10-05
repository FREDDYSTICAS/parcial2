import nano from 'nano';
import dotenv from 'dotenv';
import { CouchDBConfig } from '../types/couchdb';

dotenv.config();

const couchdbUsername = process.env.COUCHDB_USERNAME || 'freddysticas';
const couchdbPassword = process.env.COUCHDB_PASSWORD || '12345678';
const databaseName = process.env.COUCHDB_DATABASE || 'sirh_molino';

const couchdbUrl = `http://${encodeURIComponent(couchdbUsername)}:${encodeURIComponent(couchdbPassword)}@127.0.0.1:5984`;

const couchdbConfig: CouchDBConfig = {
  url: couchdbUrl
};

const couchdb = nano(couchdbConfig);
let db = couchdb.db.use(databaseName);

export const initializeDatabase = async () => {
  try {
    // Verificar acceso a la base de datos
    const dbInfo = await db.info();
    console.log(`✅ Conectado a CouchDB: ${databaseName} (${dbInfo.doc_count} documentos)`);

    // Crear/actualizar vistas
    await createViews();
    
    // Inicializar datos si es necesario
    await seedInitialData();

  } catch (error) {
    console.error('❌ Error inicializando base de datos:', error);
    throw error;
  }
};

const createViews = async () => {
  try {
    const designDoc = {
      _id: '_design/views',
      views: {
        empleados_por_documento: {
          map: `function(doc) {
            if (doc.type === 'empleado') {
              emit(doc.nro_documento, doc);
            }
          }`
        },
        empleados_por_nombre: {
          map: `function(doc) {
            if (doc.type === 'empleado') {
              emit(doc.nombre + ' ' + doc.apellido, doc);
            }
          }`
        },
        contratos_por_empleado: {
          map: `function(doc) {
            if (doc.type === 'contrato') {
              emit(doc.empleado_id, doc);
            }
          }`
        },
        usuarios_sistema: {
          map: `function(doc) {
            if (doc.type === 'usuario') {
              emit(doc.username, doc);
            }
          }`
        },
        usuarios_por_email: {
          map: `function(doc) {
            if (doc.type === 'usuario') {
              emit(doc.email, doc);
            }
          }`
        },
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

    try {
      await db.insert(designDoc);
      console.log('✅ Vistas de base de datos creadas');
    } catch (error: any) {
      if (error.statusCode === 409) {
        // Documento ya existe, actualizarlo
        const existingDoc = await db.get('_design/views');
        (designDoc as any)._rev = existingDoc._rev;
        await db.insert(designDoc);
        console.log('✅ Vistas de base de datos actualizadas');
      } else {
        throw error;
      }
    }
  } catch (error) {
    console.error('❌ Error creando vistas:', error);
    throw error;
  }
};

const seedInitialData = async () => {
  try {
    // Verificar si ya hay datos
    const result = await db.find({
      selector: { type: 'usuario' },
      limit: 1
    });

    if (result.docs.length > 0) {
      console.log('✅ Datos ya inicializados');
      return;
    }

    // Ejecutar seeding
    const { seedDatabase } = await import('../scripts/seedData');
    await seedDatabase();
    console.log('✅ Datos iniciales creados');

  } catch (error) {
    console.error('❌ Error en seeding inicial:', error);
    // No lanzar error para no bloquear el servidor
  }
};

export { db };