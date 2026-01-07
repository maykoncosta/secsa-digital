import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';

@Component({
  selector: 'app-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [class]="getButtonClasses()"
      (click)="onClick.emit($event)"
    >
      @if (loading()) {
        <svg class="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      }
      <ng-content></ng-content>
    </button>
  `,
  styles: []
})
export class ButtonComponent {
  variant = input<ButtonVariant>('primary');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input<boolean>(false);
  loading = input<boolean>(false);
  fullWidth = input<boolean>(false);
  
  onClick = output<Event>();

  getButtonClasses(): string {
    const baseClasses = 'px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed';
    const widthClass = this.fullWidth() ? 'w-full' : '';
    
    const variantClasses: Record<ButtonVariant, string> = {
      primary: 'bg-primary text-white hover:bg-blue-700',
      secondary: 'border border-secondary text-secondary hover:bg-gray-50',
      ghost: 'text-secondary hover:bg-gray-100',
      danger: 'bg-error text-white hover:bg-red-600',
      outline: 'border border-slate-300 text-slate-700 hover:bg-slate-50'
    };

    return `${baseClasses} ${variantClasses[this.variant()]} ${widthClass}`;
  }
}
