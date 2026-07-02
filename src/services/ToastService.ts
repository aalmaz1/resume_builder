/**
 * Toast Service - displays toast notifications
 */

export type ToastType = 'success' | 'error';

const TOAST_DURATION_MS = 3000;

export class ToastService {
  private currentToast: HTMLElement | null = null;

  public show(message: string, type: ToastType = 'success'): void {
    this.removeCurrentToast();

    const toast = document.createElement('div');
    toast.id = 'toast-notification';
    toast.textContent = message;
    toast.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4CAF50' : '#f44336'};
      color: white;
      padding: 12px 24px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease-out;
      font-size: 14px;
    `;
    
    document.body.appendChild(toast);
    this.currentToast = toast;

    setTimeout(() => {
      this.fadeOutAndRemove(toast);
    }, TOAST_DURATION_MS);
  }

  private fadeOutAndRemove(toast: HTMLElement): void {
    if (this.currentToast !== toast) return;
    
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s';
    setTimeout(() => {
      toast.remove();
      if (this.currentToast === toast) {
        this.currentToast = null;
      }
    }, 300);
  }

  private removeCurrentToast(): void {
    if (this.currentToast) {
      this.currentToast.remove();
      this.currentToast = null;
    }
  }
}
