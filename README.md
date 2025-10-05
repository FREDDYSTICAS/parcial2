# SIRH - Sistema de Información de Recursos Humanos
## Molino de Arroz "El Grano Dorado"

Sistema completo de gestión de recursos humanos desarrollado para un molino de arroz, con base de datos NoSQL (CouchDB) y arquitectura moderna.

## 🚀 Características

- **Autenticación segura** con JWT y recuperación de contraseña
- **Gestión completa de empleados** con CRUD y observaciones
- **Administración de contratos** vinculados a empleados
- **Búsquedas avanzadas** por documento y nombre
- **Generación de reportes** en PDF y Excel
- **Interfaz responsive** con tema del molino de arroz
- **Base de datos NoSQL** con CouchDB

## 🛠️ Tecnologías

### Frontend
- React 19 + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router
- TanStack Query
- React Hook Form + Zod
- Lucide React (iconos)
- jsPDF + xlsx (reportes)

### Backend
- Node.js + Express
- TypeScript
- CouchDB (base de datos)
- JWT (autenticación)
- Nodemailer (emails)
- Express Validator

## 📁 Estructura del Proyecto

```
sirh-molino/
├── frontend/          # Aplicación React
├── backend/           # API Express
├── database/          # Scripts de CouchDB
├── docs/             # Documentación
└── README.md
```

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+
- CouchDB 3.0+
- npm o yarn

### 1. Clonar el repositorio
```bash
git clone <url-del-repositorio>
cd sirh-molino
```

### 2. Configurar Backend
```bash
cd backend
npm install
cp env.example .env
# Editar .env con tus configuraciones
npm run dev
```

### 3. Configurar Frontend
```bash
cd frontend
npm install
npm run dev
```

### 4. Configurar CouchDB
1. Instalar CouchDB
2. Crear base de datos `sirh_molino`
3. Configurar usuario admin
4. Actualizar variables en `.env`

## 🔧 Variables de Entorno

### Backend (.env)
```env
PORT=3001
NODE_ENV=development
COUCHDB_URL=http://localhost:5984
COUCHDB_DATABASE=sirh_molino
COUCHDB_USERNAME=admin
COUCHDB_PASSWORD=admin
JWT_SECRET=tu_jwt_secret_muy_seguro
JWT_EXPIRES_IN=24h
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=tu_email@gmail.com
EMAIL_PASS=tu_password_de_aplicacion
FRONTEND_URL=http://localhost:5173
```

## 📊 Base de Datos

### Documentos de Empleados
```json
{
  "_id": "emp_001",
  "type": "empleado",
  "nro_documento": "12345678",
  "nombre": "Juan",
  "apellido": "Pérez",
  "edad": 30,
  "genero": "Masculino",
  "cargo": "Operador de Molino",
  "correo": "juan.perez@molino.com",
  "nro_contacto": "3001234567",
  "estado": "activo",
  "observaciones": []
}
```

### Documentos de Contratos
```json
{
  "_id": "cont_001",
  "type": "contrato",
  "empleado_id": "emp_001",
  "empleado_nombre": "Juan Pérez",
  "fecha_inicio": "2024-01-01",
  "fecha_fin": "2024-12-31",
  "valor_contrato": 2500000,
  "cargo": "Operador de Molino",
  "tipo_contrato": "indefinido",
  "estado": "activo"
}
```

## 🎯 Funcionalidades

### 1. Autenticación
- Login con usuario y contraseña
- Recuperación de contraseña por email
- Tokens JWT para sesiones
- Roles de usuario (Admin, Supervisor, Usuario)

### 2. Gestión de Empleados
- CRUD completo de empleados
- Búsqueda por documento o nombre
- Filtros por estado, cargo, género
- Sistema de observaciones
- Exportación a PDF/Excel

### 3. Gestión de Contratos
- CRUD de contratos
- Vinculación con empleados
- Estados de contrato
- Historial por empleado

### 4. Reportes
- Búsquedas avanzadas
- Reportes PDF y Excel
- Estadísticas de personal
- Dashboard con métricas

## 🚀 Deploy

### Frontend (Render)
- Build command: `npm run build`
- Publish directory: `dist`
- Node version: 18+

### Backend (Render)
- Build command: `npm run build`
- Start command: `npm start`
- Node version: 18+

## 📱 Responsive Design

- Mobile First
- Breakpoints: 320px, 768px, 1024px+
- Componentes adaptativos

## 🎨 Tema Visual

### Paleta de Colores
- **Dorado:** #D4AF37 (principal)
- **Marrón:** #8B4513 (secundario)
- **Verde:** #228B22 (accent)
- **Gris Claro:** #F5F5F5 (fondo)

## 🔒 Seguridad

- Autenticación JWT
- Validación de entrada
- Sanitización de datos
- Headers de seguridad
- CORS configurado

## 📈 Métricas

- Total de empleados activos
- Empleados por cargo
- Contratos próximos a vencer
- Rotación de personal
- Costos de nómina

## 🤝 Contribución

1. Fork el proyecto
2. Crear rama para feature (`git checkout -b feature/AmazingFeature`)
3. Commit cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 📞 Contacto

**Desarrollador:** [Tu Nombre]  
**Email:** [tu-email@ejemplo.com]  
**Proyecto:** SIRH Molino de Arroz  

---

*Desarrollado con ❤️ para la gestión eficiente de recursos humanos en el sector agroindustrial.*
