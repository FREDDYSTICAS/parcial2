import express from 'express';
import { body } from 'express-validator';
import { 
  getContratos, 
  getContratoById, 
  createContrato, 
  updateContrato, 
  deleteContrato,
  getContratosByEmpleado,
  getEstadisticasContratos,
  exportContratosPDF,
  exportContratosExcel
} from '../controllers/contratosController';
import { validateRequest } from '../middleware/validateRequest';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// Validaciones
const contratoValidation = [
  body('empleado_id').notEmpty().withMessage('ID de empleado es requerido'),
  body('fecha_inicio').isISO8601().withMessage('Fecha de inicio debe ser válida'),
  body('fecha_fin').isISO8601().withMessage('Fecha de fin debe ser válida'),
  body('valor_contrato').isFloat({ min: 0 }).withMessage('Valor del contrato debe ser mayor a 0'),
  body('tipo_contrato').isIn(['indefinido', 'temporal', 'prestacion_servicios']).withMessage('Tipo de contrato debe ser válido')
];

// Rutas
router.get('/', getContratos);
router.get('/estadisticas', getEstadisticasContratos);
router.get('/export/pdf', exportContratosPDF);
router.get('/export/excel', exportContratosExcel);
router.get('/empleado/:empleado_id', getContratosByEmpleado);
router.get('/:id', getContratoById);
router.post('/', contratoValidation, validateRequest, createContrato);
router.put('/:id', contratoValidation, validateRequest, updateContrato);
router.delete('/:id', deleteContrato);

export default router;
