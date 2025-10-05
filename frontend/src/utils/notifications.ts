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
  private stylesInjected = false;

  private constructor() {
    this.createContainer();
    this.injectStyles();
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
    
    const iconMap: Record<string, string> = {
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
          <h4 class="text-sm font-medium text-gray-900">${this.escapeHtml(options.title)}</h4>
          <p class="text-sm text-gray-600 mt-1">${this.escapeHtml(options.message)}</p>
        </div>
        <button 
          class="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors close-btn"
          aria-label="Cerrar notificación"
        >
          <span class="sr-only">Cerrar</span>
          <svg class="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"></path>
          </svg>
        </button>
      </div>
    `;

    // Registrar cierre por evento (evita onclick inline)
    const closeBtn = notification.querySelector('button.close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.removeNotification(notification));
    }

    return notification;
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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

  private injectStyles(): void {
    if (typeof document === 'undefined' || this.stylesInjected) return;

    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
      #notification-container { pointer-events: none; }
      #notification-container .notification { 
        pointer-events: auto; 
        background: #ffffff; 
        border: 1px solid rgba(0,0,0,0.08); 
        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1);
        border-radius: 0.5rem; 
        padding: 0.75rem 1rem; 
        width: 24rem; 
      }
      #notification-container .notification-success { border-left: 4px solid #16a34a; }
      #notification-container .notification-error { border-left: 4px solid #dc2626; }
      #notification-container .notification-warning { border-left: 4px solid #d97706; }
      #notification-container .notification-info { border-left: 4px solid #2563eb; }
      #notification-container .fade-in { 
        animation: notification-fade-in 0.2s ease-out; 
      }
      @keyframes notification-fade-in {
        from { opacity: 0; transform: translateX(20px); }
        to { opacity: 1; transform: translateX(0); }
      }
    `;

    document.head.appendChild(style);
    this.stylesInjected = true;
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
export const handleApiError = (error: unknown): string => {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string; error?: string } } }).response;
    if (response?.data?.message) {
      return response.data.message;
    }
    if (response?.data?.error) {
      return response.data.error;
    }
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return (error as { message: string }).message;
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
