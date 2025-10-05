import { db } from '../services/couchdb';
import { Empleado, Contrato, Usuario } from '../types/couchdb';
import bcrypt from 'bcryptjs';

// Función para limpiar completamente la base de datos
export const clearDatabase = async () => {
  try {
    console.log('🗑️ Limpiando base de datos...');
    
    // Obtener todos los documentos
    const allDocs = await db.list({ include_docs: true });
    
    console.log(`📊 Encontrados ${allDocs.rows.length} documentos para eliminar`);
    
    // Eliminar todos los documentos (excepto los de diseño)
    const docsToDelete = allDocs.rows
      .filter(row => !row.id.startsWith('_design/'))
      .map(row => ({ _id: row.id, _rev: row.doc?._rev }));
    
    if (docsToDelete.length > 0) {
      console.log(`🗑️ Eliminando ${docsToDelete.length} documentos...`);
      const deleteResult = await db.bulk({ docs: docsToDelete });
      console.log('✅ Documentos eliminados exitosamente');
    } else {
      console.log('ℹ️ No hay documentos para eliminar');
    }
    
    console.log('✅ Base de datos limpiada completamente');
    
  } catch (error) {
    console.error('❌ Error limpiando la base de datos:', error);
    throw error;
  }
};

// Datos de prueba actualizados
const empleadosSeed: Omit<Empleado, '_id' | '_rev'>[] = [
  {
    type: 'empleado',
    nro_documento: '12345678',
    nombre: 'Freddy',
    apellido: 'Stiven',
    edad: 30,
    genero: 'Masculino',
    cargo: 'Administrador del Sistema',
    correo: 'cfreddystiven@gmail.com',
    nro_contacto: '3001234567',
    estado: 'activo',
    observaciones: [],
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    type: 'empleado',
    nro_documento: '87654321',
    nombre: 'María',
    apellido: 'González',
    edad: 28,
    genero: 'Femenino',
    cargo: 'Supervisora de Producción',
    correo: 'maria.gonzalez@molino.com',
    nro_contacto: '3007654321',
    estado: 'activo',
    observaciones: [],
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    type: 'empleado',
    nro_documento: '11223344',
    nombre: 'Carlos',
    apellido: 'Rodríguez',
    edad: 42,
    genero: 'Masculino',
    cargo: 'Operador de Molino',
    correo: 'carlos.rodriguez@molino.com',
    nro_contacto: '3001122334',
    estado: 'activo',
    observaciones: [
      {
        fecha: '2024-01-15T10:30:00Z',
        tipo: 'felicitacion',
        descripcion: 'Excelente desempeño en el mantenimiento del molino',
        autor: 'Supervisor'
      }
    ],
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  }
];

// Los contratos se crearán dinámicamente con los IDs de los empleados creados

// Función para crear nuevos datos
export const seedNewData = async () => {
  try {
    console.log('🌱 Creando nuevos datos...');

    // Crear empleados
    console.log('👥 Creando empleados...');
    const empleadosCreados: Empleado[] = [];
    
    for (let i = 0; i < empleadosSeed.length; i++) {
      const empleadoData = empleadosSeed[i];
      const empleado: Empleado = {
        _id: `emp_${Date.now()}_${i + 1}`,
        ...empleadoData
      };
      
      try {
        await db.insert(empleado);
        empleadosCreados.push(empleado);
        console.log(`✅ Empleado creado: ${empleado.nombre} ${empleado.apellido}`);
      } catch (error: any) {
        console.error(`❌ Error creando empleado ${empleado.nombre}:`, error.message);
        throw error;
      }
    }

    // Crear contratos
    console.log('📄 Creando contratos...');
    for (let i = 0; i < empleadosCreados.length; i++) {
      const empleado = empleadosCreados[i];
      const contrato: Contrato = {
        _id: `cont_${Date.now()}_${i + 1}`,
        type: 'contrato',
        empleado_id: empleado._id,
        empleado_nombre: `${empleado.nombre} ${empleado.apellido}`,
        empleado_documento: empleado.nro_documento,
        fecha_inicio: '2024-01-01',
        fecha_fin: '2024-12-31',
        valor_contrato: empleado.cargo === 'Administrador del Sistema' ? 8000000 : 
                       empleado.cargo === 'Supervisora de Producción' ? 5000000 : 3200000,
        cargo: empleado.cargo,
        tipo_contrato: 'indefinido',
        estado: 'activo',
        fecha_creacion: '2024-01-01T08:00:00Z'
      };
      
      try {
        await db.insert(contrato);
        console.log(`✅ Contrato creado: ${contrato.empleado_nombre}`);
      } catch (error: any) {
        console.error(`❌ Error creando contrato ${contrato.empleado_nombre}:`, error.message);
        throw error;
      }
    }

    // Crear usuario administrador con las credenciales solicitadas
    console.log('👤 Creando usuario administrador...');
    const adminPassword = await bcrypt.hash('12345678', 12);
    const adminUser: Usuario = {
      _id: `user_admin_${Date.now()}`,
      type: 'usuario',
      username: 'admin',
      email: 'cfreddystiven@gmail.com',
      password_hash: adminPassword,
      rol: 'administrador',
      empleado_id: empleadosCreados[0]._id,
      activo: true,
      fecha_creacion: new Date().toISOString()
    };

    try {
      await db.insert(adminUser);
      console.log('✅ Usuario administrador creado exitosamente');
    } catch (error: any) {
      console.error('❌ Error creando usuario administrador:', error.message);
      throw error;
    }

    console.log('🎉 Datos creados exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('📧 Email: cfreddystiven@gmail.com');
    console.log('🔑 Contraseña: 12345678');
    console.log('\n📊 Datos creados:');
    console.log(`👥 Empleados: ${empleadosCreados.length}`);
    console.log(`📄 Contratos: ${empleadosCreados.length}`);
    console.log(`👤 Usuarios: 1 (admin)`);

  } catch (error) {
    console.error('❌ Error creando datos:', error);
    throw error;
  }
};

// Función principal para resetear la base de datos
export const resetDatabase = async () => {
  try {
    console.log('🔄 Iniciando reset completo de la base de datos...');
    
    // Limpiar base de datos
    await clearDatabase();
    
    // Crear nuevos datos
    await seedNewData();
    
    console.log('✅ Reset de base de datos completado exitosamente!');
    
  } catch (error) {
    console.error('❌ Error durante el reset:', error);
    throw error;
  }
};

// Ejecutar reset si se llama directamente
if (require.main === module) {
  resetDatabase()
    .then(() => {
      console.log('✅ Reset completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en reset:', error);
      process.exit(1);
    });
}
