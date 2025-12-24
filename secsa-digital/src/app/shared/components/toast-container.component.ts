import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../core/services/toast.service';
import { LucideAngularModule, X, CheckCircle, AlertCircle, AlertTriangle, Info } from 'lucide-angular';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      @for (toast of toastService.toasts(); track toast.id) {
        <div
          [class]="getToastClasses(toast.type)"
          class="min-w-80 rounded-lg shadow-lg p-4 flex items-start gap-3 animate-slide-in"
        >
          <div class="flex-shrink-0">
            @switch (toast.type) {
              @case ('success') {
                <lucide-icon [img]="CheckCircle" class="w-5 h-5" />
              }
              @case ('error') {
                <lucide-icon [img]="AlertCircle" class="w-5 h-5" />
              }
              @case ('warning') {
                <lucide-icon [img]="AlertTriangle" class="w-5 h-5" />
              }
              @case ('info') {
                <lucide-icon [img]="Info" class="w-5 h-5" />
              }
            }
          </div>
          
          <p class="flex-1 text-sm font-medium">{{ toast.message }}</p>
          
          <button
            (click)="toastService.remove(toast.id)"
            class="flex-shrink-0 hover:opacity-70 transition-opacity"
          >
            <lucide-icon [img]="X" class="w-4 h-4" />
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes slide-in {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    
    .animate-slide-in {
      animation: slide-in 0.3s ease-out;
    }
  `]
})
export class ToastContainerComponent {
  toastService = inject(ToastService);
  
  CheckCircle = CheckCircle;
  AlertCircle = AlertCircle;
  AlertTriangle = AlertTriangle;
  Info = Info;
  X = X;

  getToastClasses(type: string): string {
    const classes: Record<string, string> = {
      success: 'bg-green-50 text-green-800 border-l-4 border-success',
      error: 'bg-red-50 text-red-800 border-l-4 border-error',
      warning: 'bg-yellow-50 text-yellow-800 border-l-4 border-warning',
      info: 'bg-blue-50 text-blue-800 border-l-4 border-info'
    };
    
    return classes[type] || classes['info'];
  }
}
