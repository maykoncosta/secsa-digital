import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Componente skeleton loader para tabelas
 * Mostra animação de carregamento enquanto dados estão sendo buscados
 * 
 * @example
 * @if (loading()) {
 *   <app-table-skeleton [rows]="5" [columns]="4" />
 * } @else {
 *   <table>...</table>
 * }
 */
@Component({
  selector: 'app-table-skeleton',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="animate-pulse space-y-4">
      @for (row of rowsArray; track $index) {
        <div class="flex space-x-4">
          @for (col of columnsArray; track $index) {
            <div 
              class="h-10 bg-slate-200 rounded flex-1"
              [class.w-12]="$index === 0"
              [class.flex-none]="$index === 0"
            ></div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    @keyframes pulse {
      0%, 100% {
        opacity: 1;
      }
      50% {
        opacity: 0.5;
      }
    }
    
    .animate-pulse {
      animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `]
})
export class TableSkeletonComponent {
  /**
   * Número de linhas do skeleton
   */
  @Input() rows: number = 5;
  
  /**
   * Número de colunas do skeleton
   */
  @Input() columns: number = 4;

  get rowsArray(): number[] {
    return Array(this.rows).fill(0).map((_, i) => i);
  }

  get columnsArray(): number[] {
    return Array(this.columns).fill(0).map((_, i) => i);
  }
}
