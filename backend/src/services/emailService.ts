import nodemailer from 'nodemailer';

// Configurar transporter de email
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true para 465, false para otros puertos
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Verificar configuración de email
transporter.verify((error: any, success: any) => {
  if (error) {
    console.error('❌ Error configurando email:', error);
  } else {
    console.log('✅ Servidor de email configurado correctamente');
  }
});

// Interfaz para el email
interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

// Función para enviar email
export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'SIRH Molino <noreply@molino.com>',
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text
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
