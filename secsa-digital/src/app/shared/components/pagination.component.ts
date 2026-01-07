import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-angular';

export interface PaginationConfig {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}

@Component({
  selector: 'app-pagination',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  template: `
    <div class="flex items-center justify-between px-6 py-4 bg-white border-t border-slate-200">
      <!-- Info de Resultados -->
      <div class="text-sm text-slate-600">
        Mostrando <span class="font-medium">{{ startItem() }}</span> a 
        <span class="font-medium">{{ endItem() }}</span> de 
        <span class="font-medium">{{ config().totalItems }}</span> resultados
      </div>

      <!-- Controles de Paginação -->
      <div class="flex items-center gap-2">
        <!-- Primeira Página -->
        <button
          (click)="goToFirstPage()"
          [disabled]="isFirstPage()"
          [class.opacity-50]="isFirstPage()"
          [class.cursor-not-allowed]="isFirstPage()"
          class="p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:hover:bg-transparent"
          title="Primeira página"
        >
          <lucide-icon [img]="ChevronsLeft" class="w-4 h-4" />
        </button>

        <!-- Página Anterior -->
        <button
          (click)="previousPage()"
          [disabled]="isFirstPage()"
          [class.opacity-50]="isFirstPage()"
          [class.cursor-not-allowed]="isFirstPage()"
          class="p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:hover:bg-transparent"
          title="Página anterior"
        >
          <lucide-icon [img]="ChevronLeft" class="w-4 h-4" />
        </button>

        <!-- Números de Página -->
        <div class="flex gap-1">
          @for (page of visiblePages(); track page) {
            @if (page === -1) {
              <span class="px-3 py-2 text-slate-400">...</span>
            } @else {
              <button
                (click)="goToPage(page)"
                [class.bg-primary]="page === config().currentPage"
                [class.text-white]="page === config().currentPage"
                [class.hover:bg-slate-100]="page !== config().currentPage"
                class="px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              >
                {{ page }}
              </button>
            }
          }
        </div>

        <!-- Próxima Página -->
        <button
          (click)="nextPage()"
          [disabled]="isLastPage()"
          [class.opacity-50]="isLastPage()"
          [class.cursor-not-allowed]="isLastPage()"
          class="p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:hover:bg-transparent"
          title="Próxima página"
        >
          <lucide-icon [img]="ChevronRight" class="w-4 h-4" />
        </button>

        <!-- Última Página -->
        <button
          (click)="goToLastPage()"
          [disabled]="isLastPage()"
          [class.opacity-50]="isLastPage()"
          [class.cursor-not-allowed]="isLastPage()"
          class="p-2 rounded-lg hover:bg-slate-100 transition-colors disabled:hover:bg-transparent"
          title="Última página"
        >
          <lucide-icon [img]="ChevronsRight" class="w-4 h-4" />
        </button>

        <!-- Seletor de Tamanho de Página -->
        <select
          [value]="config().pageSize"
          (change)="onPageSizeChange($event)" 
          class="ml-4 px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        >
          <option value="10">10 por página</option>
          <option value="25">25 por página</option>
          <option value="50">50 por página</option>
          <option value="100">100 por página</option>
        </select>
      </div>
    </div>
  `
})
export class PaginationComponent {
  // Inputs
  config = input.required<PaginationConfig>();

  // Outputs
  pageChange = output<number>();
  pageSizeChange = output<number>();

  // Icons
  ChevronLeft = ChevronLeft;
  ChevronRight = ChevronRight;
  ChevronsLeft = ChevronsLeft;
  ChevronsRight = ChevronsRight;

  // Computed
  totalPages = computed(() => 
    Math.ceil(this.config().totalItems / this.config().pageSize)
  );

  startItem = computed(() => {
    if (this.config().totalItems === 0) return 0;
    return (this.config().currentPage - 1) * this.config().pageSize + 1;
  });

  endItem = computed(() => {
    const end = this.config().currentPage * this.config().pageSize;
    return Math.min(end, this.config().totalItems);
  });

  isFirstPage = computed(() => this.config().currentPage === 1);
  isLastPage = computed(() => this.config().currentPage === this.totalPages());

  visiblePages = computed(() => {
    const total = this.totalPages();
    const current = this.config().currentPage;
    const pages: number[] = [];

    if (total <= 7) {
      // Mostrar todas as páginas
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      // Mostrar primeira, última e páginas ao redor da atual
      pages.push(1);

      if (current > 3) {
        pages.push(-1); // Reticências
      }

      const start = Math.max(2, current - 1);
      const end = Math.min(total - 1, current + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (current < total - 2) {
        pages.push(-1); // Reticências
      }

      pages.push(total);
    }

    return pages;
  });

  // Methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages() && page !== this.config().currentPage) {
      this.pageChange.emit(page);
    }
  }

  previousPage() {
    if (!this.isFirstPage()) {
      this.pageChange.emit(this.config().currentPage - 1);
    }
  }

  nextPage() {
    if (!this.isLastPage()) {
      this.pageChange.emit(this.config().currentPage + 1);
    }
  }

  goToFirstPage() {
    if (!this.isFirstPage()) {
      this.pageChange.emit(1);
    }
  }

  goToLastPage() {
    if (!this.isLastPage()) {
      this.pageChange.emit(this.totalPages());
    }
  }

  onPageSizeChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.pageSizeChange.emit(Number(select.value));
  }
}
