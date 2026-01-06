import { Injectable, signal } from '@angular/core';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  type: ToastType;
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private toastId = 0;
  toasts = signal<Toast[]>([]);

  show(message: string, type: ToastType = 'info', duration: number = 5000): void {
    const id = ++this.toastId;
    const toast: Toast = { id, type, message, duration };
    
    this.toasts.update(toasts => [...toasts, toast]);

    if (duration > 0) {
      setTimeout(() => this.remove(id), duration);
    }
  }

  success(message: string, duration?: number): void {
    this.show(message, 'success', duration);
  }

  error(message: string, duration?: number): void {
    this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number): void {
    this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number): void {
    this.show(message, 'info', duration);
  }

  // Aliases com prefixo show para compatibilidade
  showSuccess(message: string, duration?: number): void {
    this.success(message, duration);
  }

  showError(message: string, duration?: number): void {
    this.error(message, duration);
  }

  showWarning(message: string, duration?: number): void {
    this.warning(message, duration);
  }

  showInfo(message: string, duration?: number): void {
    this.info(message, duration);
  }

  remove(id: number): void {
    this.toasts.update(toasts => toasts.filter(t => t.id !== id));
  }
}
