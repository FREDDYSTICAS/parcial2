import { Request, Response } from 'express';
import { db } from '../services/couchdb';
import { Contrato, Empleado } from '../types/couchdb';

// Interfaces
interface ContratoRequest extends Request {
  body: {
    empleado_id: string;
    fecha_inicio: string;
    fecha_fin: string;
    valor_contrato: number;
    tipo_contrato: string;
    cargo?: string;
  };
}

// Obtener todos los contratos
export const getContratos = async (req: Request, res: Response) => {
  try {
    const { estado, tipo_contrato, empleado_id, limit = 50, skip = 0 } = req.query;

    let selector: any = { type: 'contrato' };
    
    if (estado) {
      selector.estado = estado;
    }

    if (tipo_contrato) {
      selector.tipo_contrato = tipo_contrato;
    }

    if (empleado_id) {
      selector.empleado_id = empleado_id;
    }

    const result = await db.find({
      selector,
      limit: parseInt(limit as string),
      skip: parseInt(skip as string)
    });

    res.json({
      success: true,
      data: result.docs,
      total: result.docs.length
    });

  } catch (error) {
    console.error('Error obteniendo contratos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener contrato por ID
export const getContratoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contrato = await db.get(id) as Contrato;

    if (!contrato || contrato.type !== 'contrato') {
      return res.status(404).json({
        success: false,
        error: 'Contrato no encontrado'
      });
    }

    return res.json({
      success: true,
      data: contrato
    });

  } catch (error) {
    console.error('Error obteniendo contrato:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Crear contrato
export const createContrato = async (req: ContratoRequest, res: Response) => {
  try {
    const {
      empleado_id,
      fecha_inicio,
      fecha_fin,
      valor_contrato,
      tipo_contrato,
      cargo
    } = req.body;

    // Verificar que el empleado existe
    const empleado = await db.get(empleado_id) as Empleado;

    if (!empleado || empleado.type !== 'empleado') {
      return res.status(400).json({
        success: false,
        error: 'Empleado no encontrado'
      });
    }

    // Verificar que el empleado esté activo
    if (empleado.estado !== 'activo') {
      return res.status(400).json({
        success: false,
        error: 'No se puede crear contrato para empleado inactivo'
      });
    }

    // Crear nuevo contrato
    const nuevoContrato: Contrato = {
      _id: `cont_${Date.now()}`,
      type: 'contrato',
      empleado_id,
      empleado_nombre: `${empleado.nombre} ${empleado.apellido}`,
      empleado_documento: empleado.nro_documento,
      fecha_inicio,
      fecha_fin,
      valor_contrato,
      cargo: cargo || empleado.cargo,
      tipo_contrato: tipo_contrato as 'indefinido' | 'temporal' | 'prestacion_servicios',
      estado: 'activo',
      fecha_creacion: new Date().toISOString()
    };

    const result = await db.insert(nuevoContrato);

    return res.status(201).json({
      success: true,
      message: 'Contrato creado exitosamente',
      data: {
        id: result.id,
        ...nuevoContrato
      }
    });

  } catch (error) {
    console.error('Error creando contrato:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Actualizar contrato
export const updateContrato = async (req: ContratoRequest, res: Response) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Obtener contrato existente
    const contratoExistente = await db.get(id) as Contrato;

    if (!contratoExistente || contratoExistente.type !== 'contrato') {
      return res.status(404).json({
        success: false,
        error: 'Contrato no encontrado'
      });
    }

    // Si se cambia el empleado, verificar que existe y esté activo
    if (updateData.empleado_id && updateData.empleado_id !== contratoExistente.empleado_id) {
      const empleado = await db.get(updateData.empleado_id) as Empleado;

      if (!empleado || empleado.type !== 'empleado') {
        return res.status(400).json({
          success: false,
          error: 'Empleado no encontrado'
        });
      }

      if (empleado.estado !== 'activo') {
        return res.status(400).json({
          success: false,
          error: 'No se puede asignar contrato a empleado inactivo'
        });
      }

      // Actualizar datos del empleado en el contrato
      (updateData as any).empleado_nombre = `${empleado.nombre} ${empleado.apellido}`;
      (updateData as any).empleado_documento = empleado.nro_documento;
    }

    // Actualizar contrato
    const contratoActualizado: Contrato = {
      ...contratoExistente,
      ...updateData,
      tipo_contrato: updateData.tipo_contrato as 'indefinido' | 'temporal' | 'prestacion_servicios' || contratoExistente.tipo_contrato,
      fecha_actualizacion: new Date().toISOString()
    };

    const result = await db.insert(contratoActualizado);

    return res.json({
      success: true,
      message: 'Contrato actualizado exitosamente',
      data: contratoActualizado
    });

  } catch (error) {
    console.error('Error actualizando contrato:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Eliminar contrato
export const deleteContrato = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const contrato = await db.get(id) as Contrato;

    if (!contrato || contrato.type !== 'contrato') {
      return res.status(404).json({
        success: false,
        error: 'Contrato no encontrado'
      });
    }

    // Cambiar estado a terminado en lugar de eliminar
    contrato.estado = 'terminado';
    contrato.fecha_actualizacion = new Date().toISOString();

    await db.insert(contrato);

    return res.json({
      success: true,
      message: 'Contrato marcado como terminado'
    });

  } catch (error) {
    console.error('Error eliminando contrato:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener contratos por empleado
export const getContratosByEmpleado = async (req: Request, res: Response) => {
  try {
    const { empleado_id } = req.params;
    const { estado } = req.query;

    // Verificar que el empleado existe
    const empleado = await db.get(empleado_id) as Empleado;

    if (!empleado || empleado.type !== 'empleado') {
      return res.status(404).json({
        success: false,
        error: 'Empleado no encontrado'
      });
    }

    // Obtener contratos del empleado
    const result = await db.view('views', 'contratos_por_empleado', {
      key: empleado_id,
      include_docs: true
    });

    let contratos = result.rows.map(row => row.doc as Contrato);

    // Filtrar por estado si se especifica
    if (estado) {
      contratos = contratos.filter(contrato => contrato.estado === estado);
    }

    return res.json({
      success: true,
      data: contratos,
      total: contratos.length,
      empleado: {
        id: empleado._id,
        nombre: `${empleado.nombre} ${empleado.apellido}`,
        documento: empleado.nro_documento
      }
    });

  } catch (error) {
    console.error('Error obteniendo contratos por empleado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor'
    });
  }
};

// Obtener estadísticas de contratos
export const getEstadisticasContratos = async (req: Request, res: Response) => {
  try {
    // Obtener todos los contratos
    const result = await db.find({
      selector: { type: 'contrato' }
    });

    const contratos = result.docs as Contrato[];

    // Calcular estadísticas
    const total = contratos.length;
    const activos = contratos.filter(cont => cont.estado === 'activo').length;
    const vencidos = contratos.filter(cont => cont.estado === 'vencido').length;
    const terminados = contratos.filter(cont => cont.estado === 'terminado').length;

    // Contratos próximos a vencer (30 días)
    const hoy = new Date();
    const proximosVencer = contratos.filter(cont => {
      const fechaFin = new Date(cont.fecha_fin);
      const diasRestantes = Math.ceil((fechaFin.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24));
      return diasRestantes <= 30 && diasRestantes > 0 && cont.estado === 'activo';
    }).length;

    // Valor total de contratos activos
    const valorTotal = contratos
      .filter(cont => cont.estado === 'activo')
      .reduce((sum, cont) => sum + cont.valor_contrato, 0);

    // Por tipo de contrato
    const porTipo: Record<string, number> = {};
    contratos.forEach(cont => {
      porTipo[cont.tipo_contrato] = (porTipo[cont.tipo_contrato] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        total,
        activos,
        vencidos,
        terminados,
        proximos_vencer: proximosVencer,
        valor_total: valorTotal,
        por_tipo: porTipo
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

// Exportar contratos a PDF
export const exportContratosPDF = async (req: Request, res: Response) => {
  try {
    const { generateContratosPDF } = await import('../services/reportService');
    
    // Obtener todos los contratos
    const result = await db.find({
      selector: { type: 'contrato' }
    });

    const contratos = result.docs as Contrato[];
    
    // Generar PDF
    const pdfBuffer = generateContratosPDF(contratos);
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=contratos_${new Date().toISOString().split('T')[0]}.pdf`);
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

// Exportar contratos a Excel
export const exportContratosExcel = async (req: Request, res: Response) => {
  try {
    const { generateContratosExcel } = await import('../services/reportService');
    
    // Obtener todos los contratos
    const result = await db.find({
      selector: { type: 'contrato' }
    });

    const contratos = result.docs as Contrato[];
    
    // Generar Excel
    const excelBuffer = generateContratosExcel(contratos);
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=contratos_${new Date().toISOString().split('T')[0]}.xlsx`);
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