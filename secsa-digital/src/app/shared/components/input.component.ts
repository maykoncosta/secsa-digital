import { Component, input, forwardRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true
    }
  ],
  template: `
    <div class="space-y-1">
      @if (label()) {
        <label [for]="id()" class="block text-xs font-semibold text-slate-600">
          {{ label() }}
          @if (required()) {
            <span class="text-error">*</span>
          }
        </label>
      }
      
      <input
        [id]="id()"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled"
        [value]="value"
        (input)="onInput($event)"
        (blur)="onTouched()"
        [class]="getInputClasses()"
      />
      
      @if (error() && touched) {
        <p class="text-xs text-error">{{ error() }}</p>
      }
      
      @if (helperText() && !error()) {
        <p class="text-xs text-slate-500">{{ helperText() }}</p>
      }
    </div>
  `,
  styles: []
})
export class InputComponent implements ControlValueAccessor {
  id = input<string>(`input-${Math.random().toString(36).substr(2, 9)}`);
  label = input<string>('');
  type = input<string>('text');
  placeholder = input<string>('');
  required = input<boolean>(false);
  error = input<string>('');
  helperText = input<string>('');
  
  value: string = '';
  isDisabled = false;
  touched = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: string): void {
    this.value = value || '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.isDisabled = isDisabled;
  }

  onInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.value = input.value;
    this.onChange(this.value);
    this.touched = true;
  }

  getInputClasses(): string {
    const baseClasses = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors';
    
    if (this.error() && this.touched) {
      return `${baseClasses} border-error focus:border-error focus:ring-error/20`;
    }
    
    if (this.isDisabled) {
      return `${baseClasses} bg-slate-100 cursor-not-allowed border-gray-300`;
    }
    
    return `${baseClasses} border-gray-300 focus:border-primary focus:ring-primary/20`;
  }
}
