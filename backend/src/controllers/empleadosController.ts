import { Request, Response } from 'express';
import { db } from '../services/couchdb';
import { Empleado } from '../types/couchdb';

// Interfaces
interface EmpleadoRequest extends Request {
  body: {
    nro_documento: string;
    nombre: string;
    apellido: string;
    edad: number;
    genero: string;
    cargo: string;
    correo: string;
    nro_contacto: string;
    estado: string;
    observaciones?: any[];
  };
}

// Obtener todos los empleados
export const getEmpleados = async (req: Request, res: Response) => {
  try {
    console.log('=== OBTENIENDO EMPLEADOS ===');
    console.log('Timestamp:', new Date().toISOString());
    console.log('Query params:', req.query);
    console.log('User:', req.user);
    
    const { estado, cargo, genero, search, limit = 50, skip = 0 } = req.query;

    let selector: any = { type: 'empleado' };
    console.log('Selector inicial:', selector);
    
    if (estado) {
      selector.estado = estado;
    }
    
    if (cargo) {
      selector.cargo = cargo;
    }

    if (genero) {
      selector.genero = genero;
    }

    // Si hay búsqueda, usar vista específica
    if (search) {
      const searchResult = await db.view('views', 'empleados_por_nombre', {
        startkey: search as string,
        endkey: (search as string) + '\ufff0',
        include_docs: true
      });

      let empleados = searchResult.rows.map(row => row.doc as Empleado);

      // Aplicar filtros adicionales
      if (estado) {
        empleados = empleados.filter(emp => emp.estado === estado);
      }
      if (cargo) {
        empleados = empleados.filter(emp => emp.cargo === cargo);
      }
      if (genero) {
        empleados = empleados.filter(emp => emp.genero === genero);
      }

      return res.json({
        success: true,
        data: empleados,
        total: empleados.length
      });
    }

    console.log('Selector final:', selector);
    console.log('Ejecutando búsqueda en CouchDB...');
    
    const result = await db.find({
      selector,
      limit: parseInt(limit as string),
      skip: parseInt(skip as string)
    });

    console.log('Resultado de CouchDB:', {
      docs: result.docs.length,
      warning: result.warning
    });

    res.json({
      success: true,
      data: result.docs,
      total: result.docs.length
    });

  } catch (error: any) {
    console.error('❌ Error obteniendo empleados:', error);
    console.error('Error details:', {
      name: error?.name,
      message: error?.message,
      stack: error?.stack
    });
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      message: error?.message || 'Error desconocido'
    });
  }
};

// Obtener empleado por ID
export const getEmpleadoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const empleado = await db.get(id) as Empleado;

    if (!empleado || empleado.type !== 'empleado') {
      return res.status(404).json({
        success: false,
        error: 'Empleado no encontrado'
      });
    }

    return res.json({
      success: true,
      data: empleado
    });

  } catch (error) {
    console.error('Error obteniendo empleado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Crear empleado
export const createEmpleado = async (req: EmpleadoRequest, res: Response) => {
  try {
    const {
      nro_documento,
      nombre,
      apellido,
      edad,
      genero,
      cargo,
      correo,
      nro_contacto,
      estado,
      observaciones = []
    } = req.body;

    // Verificar si ya existe un empleado con ese documento
    const existingEmpleado = await db.view('views', 'empleados_por_documento', {
      key: nro_documento,
      include_docs: true
    });

    if (existingEmpleado.rows.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Ya existe un empleado con este número de documento'
      });
    }

    // Crear nuevo empleado
    const nuevoEmpleado: Empleado = {
      _id: `emp_${Date.now()}`,
      type: 'empleado',
      nro_documento,
      nombre,
      apellido,
      edad,
      genero: genero as 'Masculino' | 'Femenino' | 'Otro',
      cargo,
      correo,
      nro_contacto,
      estado: estado as 'activo' | 'inactivo' | 'suspendido',
      observaciones,
      fecha_creacion: new Date().toISOString(),
      fecha_actualizacion: new Date().toISOString()
    };

    const result = await db.insert(nuevoEmpleado);

    return res.status(201).json({
      success: true,
      message: 'Empleado creado exitosamente',
      data: {
        id: result.id,
        ...nuevoEmpleado
      }
    });

  } catch (error) {
    console.error('Error creando empleado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar empleado
export const updateEmpleado = async (req: EmpleadoRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Obtener empleado existente
    const empleadoExistente = await db.get(id) as Empleado;

    if (!empleadoExistente || empleadoExistente.type !== 'empleado') {
      return res.status(404).json({
        success: false,
        error: 'Empleado no encontrado'
      });
    }

    // Verificar si el documento ya existe en otro empleado
    if (updateData.nro_documento && updateData.nro_documento !== empleadoExistente.nro_documento) {
      const existingEmpleado = await db.view('views', 'empleados_por_documento', {
        key: updateData.nro_documento,
        include_docs: true
      });

      if (existingEmpleado.rows.length > 0) {
        return res.status(400).json({
          success: false,
          error: 'Ya existe otro empleado con este número de documento'
        });
      }
    }

    // Actualizar empleado
    const empleadoActualizado: Empleado = {
      ...empleadoExistente,
      ...updateData,
      genero: updateData.genero as 'Masculino' | 'Femenino' | 'Otro' || empleadoExistente.genero,
      estado: updateData.estado as 'activo' | 'inactivo' | 'suspendido' || empleadoExistente.estado,
      fecha_actualizacion: new Date().toISOString()
    };

    const result = await db.insert(empleadoActualizado);

    return res.json({
      success: true,
      message: 'Empleado actualizado exitosamente',
      data: empleadoActualizado
    });

  } catch (error) {
    console.error('Error actualizando empleado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Eliminar empleado (cambiar estado a inactivo)
export const deleteEmpleado = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const empleado = await db.get(id) as Empleado;

    if (!empleado || empleado.type !== 'empleado') {
      return res.status(404).json({
        success: false,
        error: 'Empleado no encontrado'
      });
    }

    // Cambiar estado a inactivo en lugar de eliminar
    empleado.estado = 'inactivo';
    empleado.fecha_actualizacion = new Date().toISOString();

    await db.insert(empleado);

    return res.json({
      success: true,
      message: 'Empleado marcado como inactivo'
    });

  } catch (error) {
    console.error('Error eliminando empleado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Buscar empleados
export const searchEmpleados = async (req: Request, res: Response) => {
  try {
    const { q, tipo = 'nombre' } = req.query;

    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Parámetro de búsqueda requerido'
      });
    }

    let result;

    if (tipo === 'documento') {
      // Buscar por documento
      result = await db.view('views', 'empleados_por_documento', {
        key: q as string,
        include_docs: true
      });
    } else {
      // Buscar por nombre
      result = await db.view('views', 'empleados_por_nombre', {
        key: q as string,
        include_docs: true
      });
    }

    return res.json({
      success: true,
      data: result.rows.map(row => row.doc),
      total: result.rows.length
    });

  } catch (error) {
    console.error('Error buscando empleados:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de empleados
export const getEstadisticasEmpleados = async (req: Request, res: Response) => {
  try {
    // Obtener todos los empleados
    const result = await db.find({
      selector: { type: 'empleado' }
    });

    const empleados = result.docs as Empleado[];

    // Calcular estadísticas
    const total = empleados.length;
    const activos = empleados.filter(emp => emp.estado === 'activo').length;
    const inactivos = empleados.filter(emp => emp.estado === 'inactivo').length;
    const suspendidos = empleados.filter(emp => emp.estado === 'suspendido').length;

    // Por cargo
    const porCargo: Record<string, number> = {};
    empleados.forEach(emp => {
      porCargo[emp.cargo] = (porCargo[emp.cargo] || 0) + 1;
    });

    // Por género
    const porGenero: Record<string, number> = {};
    empleados.forEach(emp => {
      porGenero[emp.genero] = (porGenero[emp.genero] || 0) + 1;
    });

    // Por edad
    const porEdad = {
      '18-25': empleados.filter(emp => emp.edad >= 18 && emp.edad <= 25).length,
      '26-35': empleados.filter(emp => emp.edad >= 26 && emp.edad <= 35).length,
      '36-45': empleados.filter(emp => emp.edad >= 36 && emp.edad <= 45).length,
      '46-55': empleados.filter(emp => emp.edad >= 46 && emp.edad <= 55).length,
      '55+': empleados.filter(emp => emp.edad > 55).length
    };

    res.json({
      success: true,
      data: {
        total,
        activos,
        inactivos,
        suspendidos,
        por_cargo: porCargo,
        por_genero: porGenero,
        por_edad: porEdad
      }
    });

  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Agregar observación a empleado
export const addObservacion = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { tipo, descripcion, autor } = req.body;

    const empleado = await db.get(id) as Empleado;

    if (!empleado || empleado.type !== 'empleado') {
      return res.status(404).json({
        success: false,
        error: 'Empleado no encontrado'
      });
    }

    const nuevaObservacion = {
      fecha: new Date().toISOString(),
      tipo,
      descripcion,
      autor
    };

    empleado.observaciones = empleado.observaciones || [];
    empleado.observaciones.push(nuevaObservacion);
    empleado.fecha_actualizacion = new Date().toISOString();

    await db.insert(empleado);

    res.json({
      success: true,
      message: 'Observación agregada exitosamente',
      data: empleado
    });

  } catch (error) {
    console.error('Error agregando observación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Exportar empleados a PDF
export const exportEmpleadosPDF = async (req: Request, res: Response) => {
  try {
    const { generateEmpleadosPDF } = await import('../services/reportService');
    
    // Obtener todos los empleados
    const result = await db.find({
      selector: { type: 'empleado' }
    });

    const empleados = result.docs as Empleado[];
    
    // Generar PDF
    const pdfBuffer = generateEmpleadosPDF(empleados);
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=empleados_${new Date().toISOString().split('T')[0]}.pdf`);
    res.setHeader('Content-Length', pdfBuffer.length);
    
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error exportando PDF:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Exportar empleados a Excel
export const exportEmpleadosExcel = async (req: Request, res: Response) => {
  try {
    const { generateEmpleadosExcel } = await import('../services/reportService');
    
    // Obtener todos los empleados
    const result = await db.find({
      selector: { type: 'empleado' }
    });

    const empleados = result.docs as Empleado[];
    
    // Generar Excel
    const excelBuffer = generateEmpleadosExcel(empleados);
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=empleados_${new Date().toISOString().split('T')[0]}.xlsx`);
    res.setHeader('Content-Length', excelBuffer.length);
    
    res.send(excelBuffer);
  } catch (error) {
    console.error('Error exportando Excel:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};