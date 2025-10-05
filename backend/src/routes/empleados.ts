import express from 'express';
import { body } from 'express-validator';
import { 
  getEmpleados, 
  getEmpleadoById, 
  createEmpleado, 
  updateEmpleado, 
  deleteEmpleado,
  searchEmpleados,
  getEstadisticasEmpleados,
  addObservacion,
  exportEmpleadosPDF,
  exportEmpleadosExcel
} from '../controllers/empleadosController';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Validaciones
const empleadoValidation = [
  body('nro_documento').notEmpty().withMessage('Número de documento es requerido'),
  body('nombre').notEmpty().withMessage('Nombre es requerido'),
  body('apellido').notEmpty().withMessage('Apellido es requerido'),
  body('edad').isInt({ min: 18, max: 100 }).withMessage('Edad debe ser entre 18 y 100'),
  body('genero').isIn(['Masculino', 'Femenino', 'Otro']).withMessage('Género debe ser válido'),
  body('cargo').notEmpty().withMessage('Cargo es requerido'),
  body('correo').isEmail().withMessage('Correo debe ser válido'),
  body('nro_contacto').notEmpty().withMessage('Número de contacto es requerido'),
  body('estado').isIn(['activo', 'inactivo', 'suspendido']).withMessage('Estado debe ser activo, inactivo o suspendido')
];

// Validaciones para observaciones
const observacionValidation = [
  body('tipo').isIn(['llamado_atencion', 'felicitacion', 'advertencia', 'otro']).withMessage('Tipo de observación debe ser válido'),
  body('descripcion').notEmpty().withMessage('Descripción es requerida'),
  body('autor').notEmpty().withMessage('Autor es requerido')
];

// Rutas
router.get('/', getEmpleados);
router.get('/search', searchEmpleados);
router.get('/estadisticas', getEstadisticasEmpleados);
router.get('/export/pdf', exportEmpleadosPDF);
router.get('/export/excel', exportEmpleadosExcel);
router.get('/:id', getEmpleadoById);
router.post('/', empleadoValidation, validateRequest, createEmpleado);
router.put('/:id', empleadoValidation, validateRequest, updateEmpleado);
router.delete('/:id', deleteEmpleado);
router.post('/:id/observaciones', observacionValidation, validateRequest, addObservacion);

export default router;
