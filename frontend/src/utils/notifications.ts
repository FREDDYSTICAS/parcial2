// Utilidades para manejo de notificaciones y errores

export interface NotificationOptions {
  type: 'success' | 'error' | 'warning' | 'info';
  title: string;
  message: string;
  duration?: number;
}

export class NotificationManager {
  private static instance: NotificationManager;
  private container: HTMLElement | null = null;

  private constructor() {
    this.createContainer();
  }

  public static getInstance(): NotificationManager {
    if (!NotificationManager.instance) {
      NotificationManager.instance = new NotificationManager();
    }
    return NotificationManager.instance;
  }

  private createContainer(): void {
    if (typeof document !== 'undefined') {
      this.container = document.createElement('div');
      this.container.id = 'notification-container';
      this.container.className = 'fixed top-4 right-4 z-50 space-y-2';
      document.body.appendChild(this.container);
    }
  }

  public show(options: NotificationOptions): void {
    if (!this.container) return;

    const notification = this.createNotification(options);
    this.container.appendChild(notification);

    // Auto-remove after duration
    const duration = options.duration || 5000;
    setTimeout(() => {
      this.removeNotification(notification);
    }, duration);
  }

  private createNotification(options: NotificationOptions): HTMLElement {
    const notification = document.createElement('div');
    notification.className = `notification notification-${options.type} fade-in`;
    
    const iconMap = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    notification.innerHTML = `
      <div class="flex items-start space-x-3">
        <div class="flex-shrink-0">
          <span class="text-lg">${iconMap[options.type]}</span>
        </div>
        <div class="flex-1">
          <h4 class="text-sm font-medium text-gray-900">${options.title}</h4>
          <p class="text-sm text-gray-600 mt-1">${options.message}</p>
        </div>
        <button 
          class="flex-shrink-0 text-gray-400 hover:text-gray-600"
          onclick="this.parentElement.parentElement.remove()"
        >
          <span class="sr-only">Cerrar</span>
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;

    return notification;
  }

  private removeNotification(notification: HTMLElement): void {
    if (notification.parentNode) {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(100%)';
      notification.style.transition = 'all 0.3s ease-out';
      
      setTimeout(() => {
        notification.parentNode?.removeChild(notification);
      }, 300);
    }
  }

  // Métodos de conveniencia
  public success(title: string, message: string, duration?: number): void {
    this.show({ type: 'success', title, message, duration });
  }

  public error(title: string, message: string, duration?: number): void {
    this.show({ type: 'error', title, message, duration: duration || 8000 });
  }

  public warning(title: string, message: string, duration?: number): void {
    this.show({ type: 'warning', title, message, duration });
  }

  public info(title: string, message: string, duration?: number): void {
    this.show({ type: 'info', title, message, duration });
  }
}

// Instancia singleton
export const notifications = NotificationManager.getInstance();

// Utilidades para manejo de errores de API
export const handleApiError = (error: any): string => {
  if (error.response?.data?.message) {
    return error.response.data.message;
  }
  
  if (error.response?.data?.error) {
    return error.response.data.error;
  }
  
  if (error.message) {
    return error.message;
  }
  
  return 'Ha ocurrido un error inesperado';
};

// Utilidades para formateo
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(date));
};

export const formatDateTime = (date: string | Date): string => {
  return new Intl.DateTimeFormat('es-CO', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};
