import nodemailer from 'nodemailer';

// Bandera para deshabilitar correo en entornos sin SMTP
const EMAIL_DISABLED = (process.env.EMAIL_DISABLED || 'false').toLowerCase() === 'true';

// Compatibilidad con distintas variables de entorno (SMTP_* o EMAIL_*)
const SMTP_HOST = process.env.SMTP_HOST || process.env.EMAIL_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || process.env.EMAIL_PORT || '587');
const SMTP_SECURE = (process.env.SMTP_SECURE || '').toLowerCase() === 'true' || SMTP_PORT === 465;
const SMTP_USER = process.env.SMTP_USER || process.env.EMAIL_USER;
const SMTP_PASS = process.env.SMTP_PASS || process.env.EMAIL_PASS;
const EMAIL_FROM = process.env.EMAIL_FROM || 'SIRH Molino <noreply@molino.com>';

// Crear transporter solo si no está deshabilitado y hay credenciales
const transporter = !EMAIL_DISABLED && SMTP_USER && SMTP_PASS
  ? nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS
      },
      connectionTimeout: 10_000,
      socketTimeout: 10_000
    })
  : null;

// Verificar configuración de email si hay transporter y está habilitado explícitamente
const VERIFY_ON_BOOT = (process.env.SMTP_VERIFY_ON_BOOT || 'false').toLowerCase() === 'true';
if (transporter && VERIFY_ON_BOOT) {
  transporter.verify((error: any) => {
    if (error) {
      console.error('❌ Error configurando email:', error);
    } else {
      console.log('✅ Servidor de email configurado correctamente');
    }
  });
} else if (EMAIL_DISABLED) {
  console.log('✳️ Email deshabilitado por EMAIL_DISABLED=true');
} else {
  console.warn('⚠️ Email no configurado: faltan SMTP_USER/SMTP_PASS. El envío se omitirá.');
}

// Interfaz para el email
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType: string;
  }>;
}

// Función para enviar email
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    if (!transporter) {
      console.log('✳️ Email omitido (deshabilitado o no configurado):', {
        to: options.to,
        subject: options.subject
      });
      return;
    }

    const mailOptions = {
      from: EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
      attachments: options.attachments
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('📧 Email enviado:', info.messageId);
  } catch (error) {
    console.error('❌ Error enviando email:', error);
    throw error;
  }
};

// Función para enviar email de bienvenida
export const sendWelcomeEmail = async (email: string, username: string, password: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #D4AF37;">¡Bienvenido al SIRH Molino de Arroz!</h2>
      <p>Hola ${username},</p>
      <p>Tu cuenta ha sido creada exitosamente. Aquí están tus credenciales:</p>
      <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0;">
        <p><strong>Usuario:</strong> ${username}</p>
        <p><strong>Contraseña temporal:</strong> ${password}</p>
      </div>
      <p>Por favor, cambia tu contraseña en tu primer inicio de sesión.</p>
      <p>Puedes acceder al sistema en: <a href="${process.env.FRONTEND_URL}">${process.env.FRONTEND_URL}</a></p>
      <p>Saludos,<br>Equipo SIRH Molino de Arroz</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Bienvenido al SIRH Molino de Arroz',
    html
  });
};

// Función para enviar email de recuperación de contraseña
export const sendPasswordResetEmail = async (email: string, username: string, resetToken: string): Promise<void> => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #D4AF37;">Recuperación de contraseña</h2>
      <p>Hola ${username},</p>
      <p>Has solicitado recuperar tu contraseña. Haz clic en el siguiente botón:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${process.env.FRONTEND_URL}/reset-password?token=${resetToken}" 
           style="background-color: #D4AF37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
          Recuperar contraseña
        </a>
      </div>
      <p>Este enlace expira en 1 hora.</p>
      <p>Si no solicitaste este cambio, ignora este email.</p>
      <p>Saludos,<br>Equipo SIRH Molino de Arroz</p>
    </div>
  `;

  await sendEmail({
    to: email,
    subject: 'Recuperación de contraseña - SIRH Molino',
    html
  });
};

export default transporter;
