import { Component, signal, output, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from './button.component';
import { LucideAngularModule, AlertTriangle, X } from 'lucide-angular';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'warning' | 'danger' | 'info';
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, ButtonComponent, LucideAngularModule],
  template: `
    @if (isOpen()) {
      <div 
        class="fixed inset-0 z-50 overflow-y-auto" 
        (click)="onBackdropClick($event)"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="'dialog-title-' + dialogId"
        [attr.aria-describedby]="'dialog-description-' + dialogId"
      >
        <div class="flex min-h-screen items-center justify-center p-4">
          <!-- Backdrop -->
          <div class="fixed inset-0 bg-black/50 transition-opacity" aria-hidden="true"></div>
          
          <!-- Modal -->
          <div class="relative bg-white rounded-xl shadow-2xl w-full max-w-md" (click)="$event.stopPropagation()">
            <!-- Header -->
            <div class="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div class="flex items-center gap-3">
                @if (data().type === 'danger' || data().type === 'warning') {
                  <lucide-icon 
                    [img]="AlertTriangle" 
                    class="w-6 h-6"
                    [class.text-red-600]="data().type === 'danger'"
                    [class.text-yellow-600]="data().type === 'warning'"
                    aria-hidden="true"
                  />
                }
                <h2 
                  [id]="'dialog-title-' + dialogId"
                  class="text-xl font-semibold text-slate-900"
                >
                  {{ data().title }}
                </h2>
              </div>
              <button
                type="button"
                (click)="onCancel()"
                class="text-slate-400 hover:text-slate-600 transition-colors p-1 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-300"
                aria-label="Fechar diálogo"
              >
                <lucide-icon [img]="X" class="w-5 h-5" aria-hidden="true" />
              </button>
            </div>

            <!-- Body -->
            <div class="px-6 py-6">
              <p 
                [id]="'dialog-description-' + dialogId"
                class="text-slate-700 whitespace-pre-line"
              >
                {{ data().message }}
              </p>
            </div>

            <!-- Footer -->
            <div class="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <app-button
                variant="secondary"
                (onClick)="onCancel()"
                [ariaLabel]="data().cancelText || 'Cancelar ação'"
              >
                {{ data().cancelText || 'Cancelar' }}
              </app-button>
              <app-button
                [variant]="data().type === 'danger' ? 'danger' : 'primary'"
                (onClick)="onConfirm()"
                [ariaLabel]="data().confirmText || 'Confirmar ação'"
              >
                {{ data().confirmText || 'Confirmar' }}
              </app-button>
            </div>
          </div>
        </div>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  isOpen = input<boolean>(false);
  data = input<ConfirmDialogData>({
    title: 'Confirmar ação',
    message: 'Deseja continuar?',
    confirmText: 'Confirmar',
    cancelText: 'Cancelar',
    type: 'info'
  });

  confirmed = output<void>();
  cancelled = output<void>();

  // Unique ID for accessibility
  dialogId = Math.random().toString(36).substr(2, 9);

  // Icons
  AlertTriangle = AlertTriangle;
  X = X;

  onConfirm() {
    this.confirmed.emit();
  }

  onCancel() {
    this.cancelled.emit();
  }

  onBackdropClick(event: MouseEvent) {
    if (event.target === event.currentTarget) {
      this.onCancel();
    }
  }
}
