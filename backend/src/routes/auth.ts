import express from 'express';
import { body } from 'express-validator';
import { login, register, forgotPassword, resetPassword } from '../controllers/authController';
import { validateRequest } from '../middleware/validateRequest';

const router = express.Router();

// Validaciones
const loginValidation = [
  body('email').isEmail().withMessage('Email debe ser válido'),
  body('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres')
];

const registerValidation = [
  body('username').isLength({ min: 3 }).withMessage('Username debe tener al menos 3 caracteres'),
  body('email').isEmail().withMessage('Email debe ser válido'),
  body('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres'),
  body('empleado_id').notEmpty().withMessage('ID de empleado es requerido')
];

const forgotPasswordValidation = [
  body('email').isEmail().withMessage('Email debe ser válido')
];

const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Token es requerido'),
  body('password').isLength({ min: 6 }).withMessage('Password debe tener al menos 6 caracteres')
];

// Rutas
router.post('/login', loginValidation, validateRequest, login);
router.post('/register', registerValidation, validateRequest, register);
router.post('/forgot-password', forgotPasswordValidation, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidation, validateRequest, resetPassword);

export default router;
