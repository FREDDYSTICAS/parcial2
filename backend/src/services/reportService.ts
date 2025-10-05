import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import type { Empleado, Contrato } from '../types/couchdb';

// Extender jsPDF para incluir autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

// Generar PDF de empleados
export const generateEmpleadosPDF = (empleados: Empleado[]): Buffer => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.text('Reporte de Empleados - SIRH Molino', 14, 22);
  
  // Fecha de generación
  doc.setFontSize(10);
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-CO')}`, 14, 30);
  
  // Tabla de empleados
  const tableData = empleados.map(emp => [
    emp.nro_documento,
    `${emp.nombre} ${emp.apellido}`,
    emp.edad,
    emp.genero,
    emp.cargo,
    emp.correo,
    emp.nro_contacto,
    emp.estado.charAt(0).toUpperCase() + emp.estado.slice(1)
  ]);

  (doc as any).autoTable({
    head: [['Documento', 'Nombre', 'Edad', 'Género', 'Cargo', 'Email', 'Contacto', 'Estado']],
    body: tableData,
    startY: 35,
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [212, 175, 55], // Color dorado del molino
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  return Buffer.from(doc.output('arraybuffer'));
};

// Generar PDF de contratos
export const generateContratosPDF = (contratos: Contrato[]): Buffer => {
  const doc = new jsPDF();
  
  // Título
  doc.setFontSize(20);
  doc.text('Reporte de Contratos - SIRH Molino', 14, 22);
  
  // Fecha de generación
  doc.setFontSize(10);
  doc.text(`Generado el: ${new Date().toLocaleDateString('es-CO')}`, 14, 30);
  
  // Tabla de contratos
  const tableData = contratos.map(cont => [
    cont.empleado_documento,
    cont.empleado_nombre,
    cont.cargo,
    cont.tipo_contrato.charAt(0).toUpperCase() + cont.tipo_contrato.slice(1),
    new Date(cont.fecha_inicio).toLocaleDateString('es-CO'),
    new Date(cont.fecha_fin).toLocaleDateString('es-CO'),
    `$${cont.valor_contrato.toLocaleString('es-CO')}`,
    cont.estado.charAt(0).toUpperCase() + cont.estado.slice(1)
  ]);

  (doc as any).autoTable({
    head: [['Documento', 'Empleado', 'Cargo', 'Tipo', 'Inicio', 'Fin', 'Valor', 'Estado']],
    body: tableData,
    startY: 35,
    styles: {
      fontSize: 8,
      cellPadding: 3
    },
    headStyles: {
      fillColor: [212, 175, 55], // Color dorado del molino
      textColor: 255,
      fontStyle: 'bold'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    }
  });

  return Buffer.from(doc.output('arraybuffer'));
};

// Generar Excel de empleados
export const generateEmpleadosExcel = (empleados: Empleado[]): Buffer => {
  const worksheet = XLSX.utils.json_to_sheet(
    empleados.map(emp => ({
      'Número de Documento': emp.nro_documento,
      'Nombre Completo': `${emp.nombre} ${emp.apellido}`,
      'Edad': emp.edad,
      'Género': emp.genero,
      'Cargo': emp.cargo,
      'Email': emp.correo,
      'Número de Contacto': emp.nro_contacto,
      'Estado': emp.estado.charAt(0).toUpperCase() + emp.estado.slice(1),
      'Fecha de Creación': new Date(emp.fecha_creacion || new Date()).toLocaleDateString('es-CO'),
      'Última Actualización': new Date(emp.fecha_actualizacion || new Date()).toLocaleDateString('es-CO')
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Empleados');
  
  return Buffer.from(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }));
};

// Generar Excel de contratos
export const generateContratosExcel = (contratos: Contrato[]): Buffer => {
  const worksheet = XLSX.utils.json_to_sheet(
    contratos.map(cont => ({
      'Documento Empleado': cont.empleado_documento,
      'Nombre Empleado': cont.empleado_nombre,
      'Cargo': cont.cargo,
      'Tipo de Contrato': cont.tipo_contrato.charAt(0).toUpperCase() + cont.tipo_contrato.slice(1),
      'Fecha de Inicio': new Date(cont.fecha_inicio).toLocaleDateString('es-CO'),
      'Fecha de Fin': new Date(cont.fecha_fin).toLocaleDateString('es-CO'),
      'Valor del Contrato': cont.valor_contrato,
      'Estado': cont.estado.charAt(0).toUpperCase() + cont.estado.slice(1),
      'Fecha de Creación': new Date(cont.fecha_creacion || new Date()).toLocaleDateString('es-CO')
    }))
  );

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Contratos');
  
  return Buffer.from(XLSX.write(workbook, { type: 'array', bookType: 'xlsx' }));
};
