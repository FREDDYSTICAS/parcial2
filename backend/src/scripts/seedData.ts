import { db } from '../services/couchdb';
import { Empleado, Contrato, Usuario } from '../types/couchdb';
import bcrypt from 'bcryptjs';

// Datos de prueba para el molino de arroz
const empleadosSeed: Omit<Empleado, '_id' | '_rev'>[] = [
  {
    type: 'empleado',
    nro_documento: '12345678',
    nombre: 'Juan',
    apellido: 'Pérez',
    nombre_apellido: 'Juan Pérez',
    edad: 35,
    genero: 'Masculino',
    cargo: 'Gerente General',
    correo: 'juan.perez@molino.com',
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
    nombre_apellido: 'María González',
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
    nombre_apellido: 'Carlos Rodríguez',
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
  },
  {
    type: 'empleado',
    nro_documento: '55667788',
    nombre: 'Ana',
    apellido: 'Martínez',
    nombre_apellido: 'Ana Martínez',
    edad: 31,
    genero: 'Femenino',
    cargo: 'Contadora',
    correo: 'ana.martinez@molino.com',
    nro_contacto: '3005566778',
    estado: 'activo',
    observaciones: [],
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  },
  {
    type: 'empleado',
    nro_documento: '99887766',
    nombre: 'Luis',
    apellido: 'Hernández',
    nombre_apellido: 'Luis Hernández',
    edad: 25,
    genero: 'Masculino',
    cargo: 'Auxiliar Administrativo',
    correo: 'luis.hernandez@molino.com',
    nro_contacto: '3009988776',
    estado: 'activo',
    observaciones: [],
    fecha_creacion: new Date().toISOString(),
    fecha_actualizacion: new Date().toISOString()
  }
];

const contratosSeed: Omit<Contrato, '_id' | '_rev'>[] = [
  {
    type: 'contrato',
    empleado_id: 'emp_1',
    empleado_nombre: 'Juan Pérez',
    empleado_documento: '12345678',
    fecha_inicio: '2024-01-01',
    fecha_fin: '2024-12-31',
    valor_contrato: 8000000,
    cargo: 'Gerente General',
    tipo_contrato: 'indefinido',
    estado: 'activo',
    fecha_creacion: '2024-01-01T08:00:00Z'
  },
  {
    type: 'contrato',
    empleado_id: 'emp_2',
    empleado_nombre: 'María González',
    empleado_documento: '87654321',
    fecha_inicio: '2024-02-01',
    fecha_fin: '2024-12-31',
    valor_contrato: 5000000,
    cargo: 'Supervisora de Producción',
    tipo_contrato: 'indefinido',
    estado: 'activo',
    fecha_creacion: '2024-02-01T08:00:00Z'
  },
  {
    type: 'contrato',
    empleado_id: 'emp_3',
    empleado_nombre: 'Carlos Rodríguez',
    empleado_documento: '11223344',
    fecha_inicio: '2024-01-15',
    fecha_fin: '2024-12-31',
    valor_contrato: 3200000,
    cargo: 'Operador de Molino',
    tipo_contrato: 'indefinido',
    estado: 'activo',
    fecha_creacion: '2024-01-15T08:00:00Z'
  },
  {
    type: 'contrato',
    empleado_id: 'emp_4',
    empleado_nombre: 'Ana Martínez',
    empleado_documento: '55667788',
    fecha_inicio: '2024-03-01',
    fecha_fin: '2024-12-31',
    valor_contrato: 4000000,
    cargo: 'Contadora',
    tipo_contrato: 'indefinido',
    estado: 'activo',
    fecha_creacion: '2024-03-01T08:00:00Z'
  },
  {
    type: 'contrato',
    empleado_id: 'emp_5',
    empleado_nombre: 'Luis Hernández',
    empleado_documento: '99887766',
    fecha_inicio: '2024-04-01',
    fecha_fin: '2024-12-31',
    valor_contrato: 2500000,
    cargo: 'Auxiliar Administrativo',
    tipo_contrato: 'temporal',
    estado: 'activo',
    fecha_creacion: '2024-04-01T08:00:00Z'
  }
];

export const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seeding de la base de datos...');

    // Crear empleados
    console.log('👥 Creando empleados...');
    const empleadosCreados: Empleado[] = [];
    
    for (let i = 0; i < empleadosSeed.length; i++) {
      const empleadoData = empleadosSeed[i];
      const empleado: Empleado = {
        _id: `emp_${i + 1}`,
        ...empleadoData
      };
      
      try {
        await db.insert(empleado);
        empleadosCreados.push(empleado);
        console.log(`✅ Empleado creado: ${empleado.nombre} ${empleado.apellido}`);
      } catch (error: any) {
        if (error.statusCode === 409) {
          console.log(`⚠️ Empleado ya existe: ${empleado.nombre} ${empleado.apellido}`);
        } else {
          console.error(`❌ Error creando empleado ${empleado.nombre}:`, error.message);
        }
      }
    }

    // Crear contratos
    console.log('📄 Creando contratos...');
    for (let i = 0; i < contratosSeed.length; i++) {
      const contratoData = contratosSeed[i];
      const contrato: Contrato = {
        _id: `cont_${i + 1}`,
        ...contratoData
      };
      
      try {
        await db.insert(contrato);
        console.log(`✅ Contrato creado: ${contrato.empleado_nombre}`);
      } catch (error: any) {
        if (error.statusCode === 409) {
          console.log(`⚠️ Contrato ya existe: ${contrato.empleado_nombre}`);
        } else {
          console.error(`❌ Error creando contrato ${contrato.empleado_nombre}:`, error.message);
        }
      }
    }

    // Crear usuario administrador
    console.log('👤 Creando usuario administrador...');
    const adminPassword = await bcrypt.hash('12345678', 12);
    const adminUser: Usuario = {
      _id: 'user_admin',
      type: 'usuario',
      username: 'cfreddystiven',
      email: 'cfreddystivengmail.com',
      password_hash: adminPassword,
      rol: 'administrador',
      empleado_id: 'emp_1',
      activo: true,
      fecha_creacion: new Date().toISOString()
    };

    try {
      await db.insert(adminUser);
      console.log('✅ Usuario administrador creado: cfreddystiven / 12345678');
    } catch (error: any) {
      if (error.statusCode === 409) {
        console.log('⚠️ Usuario administrador ya existe');
      } else {
        console.error('❌ Error creando usuario administrador:', error.message);
      }
    }

    console.log('🎉 Seeding completado exitosamente!');
    console.log('\n📋 Credenciales de acceso:');
    console.log('👤 Usuario: admin');
    console.log('🔑 Contraseña: admin123');
    console.log('\n📊 Datos creados:');
    console.log(`👥 Empleados: ${empleadosCreados.length}`);
    console.log(`📄 Contratos: ${contratosSeed.length}`);
    console.log(`👤 Usuarios: 1 (admin)`);

  } catch (error) {
    console.error('❌ Error durante el seeding:', error);
    throw error;
  }
};

// Ejecutar seeding si se llama directamente
if (require.main === module) {
  seedDatabase()
    .then(() => {
      console.log('✅ Seeding completado');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en seeding:', error);
      process.exit(1);
    });
}
