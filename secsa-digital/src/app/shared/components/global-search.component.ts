import { Component, signal, computed, inject, HostListener, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { LucideAngularModule, Search, Clock, Users, FileText, X, TrendingUp } from 'lucide-angular';
import { FormsModule } from '@angular/forms';

// Interfaces
interface SearchResult {
  id: string;
  type: 'paciente' | 'exame' | 'schema';
  title: string;
  subtitle: string;
  route: string;
}

interface RecentSearch {
  query: string;
  timestamp: number;
}

@Component({
  selector: 'app-global-search',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, FormsModule],
  template: `
    <!-- Overlay -->
    @if (isOpen()) {
      <div 
        class="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm animate-fadeIn"
        (click)="close()"
      >
        <!-- Search Modal -->
        <div 
          class="fixed top-[15%] left-1/2 -translate-x-1/2 w-full max-w-2xl animate-slideDown"
          (click)="$event.stopPropagation()"
        >
          <div class="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
            <!-- Search Input -->
            <div class="flex items-center gap-3 p-4 border-b border-slate-200">
              <lucide-icon [img]="Search" class="w-5 h-5 text-slate-400 flex-shrink-0" />
              <input
                #searchInput
                type="text"
                [(ngModel)]="searchQuery"
                (input)="onSearchChange()"
                placeholder="Buscar pacientes, exames ou schemas..."
                class="flex-1 text-base outline-none text-slate-900 placeholder-slate-400"
                autocomplete="off"
              />
              @if (searchQuery()) {
                <button
                  type="button"
                  (click)="clearSearch()"
                  class="text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <lucide-icon [img]="X" class="w-4 h-4" />
                </button>
              }
              <kbd class="hidden sm:inline-flex items-center gap-1 px-2 py-1 text-xs font-semibold text-slate-500 bg-slate-100 border border-slate-200 rounded">
                ESC
              </kbd>
            </div>

            <!-- Results -->
            <div class="max-h-[400px] overflow-y-auto">
              @if (isSearching()) {
                <!-- Loading -->
                <div class="p-8 text-center">
                  <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <p class="mt-2 text-sm text-slate-600">Buscando...</p>
                </div>
              } @else if (searchQuery() && results().length === 0) {
                <!-- No Results -->
                <div class="p-8 text-center">
                  <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <lucide-icon [img]="Search" class="w-8 h-8 text-slate-400" />
                  </div>
                  <p class="text-slate-600 font-medium">Nenhum resultado encontrado</p>
                  <p class="text-sm text-slate-500 mt-1">Tente usar outros termos de busca</p>
                </div>
              } @else if (!searchQuery() && recentSearches().length > 0) {
                <!-- Recent Searches -->
                <div class="p-2">
                  <div class="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wide">
                    Buscas Recentes
                  </div>
                  @for (recent of recentSearches(); track recent.query) {
                    <button
                      type="button"
                      (click)="applyRecentSearch(recent.query)"
                      class="w-full flex items-center gap-3 px-3 py-2 text-left hover:bg-slate-50 rounded-lg transition-colors group"
                    >
                      <lucide-icon [img]="Clock" class="w-4 h-4 text-slate-400 flex-shrink-0" />
                      <span class="flex-1 text-sm text-slate-700">{{ recent.query }}</span>
                      <lucide-icon [img]="TrendingUp" class="w-3 h-3 text-slate-300 group-hover:text-slate-400" />
                    </button>
                  }
                </div>
              } @else if (searchQuery() && results().length > 0) {
                <!-- Search Results -->
                <div class="p-2">
                  @for (result of results(); track result.id; let i = $index) {
                    <button
                      type="button"
                      (click)="selectResult(result)"
                      (mouseenter)="selectedIndex.set(i)"
                      [class.bg-primary]="selectedIndex() === i"
                      [class.text-white]="selectedIndex() === i"
                      class="w-full flex items-center gap-3 px-3 py-3 text-left hover:bg-slate-50 rounded-lg transition-colors group"
                    >
                      <!-- Icon -->
                      <div [class.bg-blue-100]="result.type === 'paciente' && selectedIndex() !== i"
                           [class.text-blue-600]="result.type === 'paciente' && selectedIndex() !== i"
                           [class.bg-green-100]="result.type === 'exame' && selectedIndex() !== i"
                           [class.text-green-600]="result.type === 'exame' && selectedIndex() !== i"
                           [class.bg-purple-100]="result.type === 'schema' && selectedIndex() !== i"
                           [class.text-purple-600]="result.type === 'schema' && selectedIndex() !== i"
                           [class.bg-white/20]="selectedIndex() === i"
                           [class.text-white]="selectedIndex() === i"
                           class="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0">
                        @if (result.type === 'paciente') {
                          <lucide-icon [img]="Users" class="w-4 h-4" />
                        } @else {
                          <lucide-icon [img]="FileText" class="w-4 h-4" />
                        }
                      </div>

                      <!-- Content -->
                      <div class="flex-1 min-w-0">
                        <p [class.text-white]="selectedIndex() === i"
                           [class.text-slate-900]="selectedIndex() !== i"
                           class="text-sm font-medium truncate">
                          {{ result.title }}
                        </p>
                        <p [class.text-white/70]="selectedIndex() === i"
                           [class.text-slate-500]="selectedIndex() !== i"
                           class="text-xs truncate">
                          {{ result.subtitle }}
                        </p>
                      </div>

                      <!-- Badge -->
                      <span [class.bg-white/20]="selectedIndex() === i"
                            [class.text-white]="selectedIndex() === i"
                            [class.bg-slate-100]="selectedIndex() !== i"
                            [class.text-slate-600]="selectedIndex() !== i"
                            class="px-2 py-1 text-xs font-medium rounded">
                        {{ getTypeName(result.type) }}
                      </span>
                    </button>
                  }
                </div>
              } @else {
                <!-- Empty State -->
                <div class="p-8 text-center">
                  <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-slate-100 flex items-center justify-center">
                    <lucide-icon [img]="Search" class="w-8 h-8 text-slate-400" />
                  </div>
                  <p class="text-slate-600 font-medium">Busca Global</p>
                  <p class="text-sm text-slate-500 mt-1">Digite para buscar pacientes, exames ou schemas</p>
                </div>
              }
            </div>

            <!-- Footer -->
            <div class="hidden sm:flex items-center gap-4 px-4 py-3 bg-slate-50 border-t border-slate-200 text-xs text-slate-500">
              <div class="flex items-center gap-2">
                <kbd class="px-2 py-1 bg-white border border-slate-200 rounded font-semibold">↑↓</kbd>
                <span>Navegar</span>
              </div>
              <div class="flex items-center gap-2">
                <kbd class="px-2 py-1 bg-white border border-slate-200 rounded font-semibold">Enter</kbd>
                <span>Selecionar</span>
              </div>
              <div class="flex items-center gap-2">
                <kbd class="px-2 py-1 bg-white border border-slate-200 rounded font-semibold">ESC</kbd>
                <span>Fechar</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translate(-50%, -20px);
      }
      to {
        opacity: 1;
        transform: translate(-50%, 0);
      }
    }
    
    .animate-fadeIn {
      animation: fadeIn 150ms ease-out;
    }
    
    .animate-slideDown {
      animation: slideDown 200ms ease-out;
    }
  `]
})
export class GlobalSearchComponent {
  private router = inject(Router);

  // Icons
  Search = Search;
  Clock = Clock;
  Users = Users;
  FileText = FileText;
  X = X;
  TrendingUp = TrendingUp;

  // State
  isOpen = signal(false);
  searchQuery = signal('');
  isSearching = signal(false);
  results = signal<SearchResult[]>([]);
  selectedIndex = signal(0);
  recentSearches = signal<RecentSearch[]>([]);

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  constructor() {
    this.loadRecentSearches();
  }

  @HostListener('document:keydown', ['$event'])
  handleKeyboard(event: KeyboardEvent): void {
    // Ctrl+K ou Cmd+K para abrir
    if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
      event.preventDefault();
      this.open();
      return;
    }

    // Esc para fechar
    if (event.key === 'Escape' && this.isOpen()) {
      event.preventDefault();
      this.close();
      return;
    }

    // Navegação com setas (apenas quando aberto)
    if (!this.isOpen()) return;

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      this.selectedIndex.update(i => Math.min(i + 1, this.results().length - 1));
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      this.selectedIndex.update(i => Math.max(i - 1, 0));
    } else if (event.key === 'Enter') {
      event.preventDefault();
      const selected = this.results()[this.selectedIndex()];
      if (selected) {
        this.selectResult(selected);
      }
    }
  }

  open(): void {
    this.isOpen.set(true);
    setTimeout(() => {
      this.searchInput?.nativeElement.focus();
    }, 100);
  }

  close(): void {
    this.isOpen.set(false);
    this.searchQuery.set('');
    this.results.set([]);
    this.selectedIndex.set(0);
  }

  clearSearch(): void {
    this.searchQuery.set('');
    this.results.set([]);
    this.selectedIndex.set(0);
    this.searchInput?.nativeElement.focus();
  }

  onSearchChange(): void {
    this.selectedIndex.set(0);
    
    const query = this.searchQuery().trim();
    
    if (!query) {
      this.results.set([]);
      return;
    }

    this.isSearching.set(true);
    
    // Simular busca (substituir com chamadas reais ao Firestore)
    setTimeout(() => {
      this.performSearch(query);
      this.isSearching.set(false);
    }, 300);
  }

  private performSearch(query: string): void {
    const lowerQuery = query.toLowerCase();
    const mockResults: SearchResult[] = [];

    // Aqui você substituiria com buscas reais no Firestore
    // Exemplo de resultados mock:
    if (lowerQuery.includes('joao') || lowerQuery.includes('joão')) {
      mockResults.push({
        id: '1',
        type: 'paciente',
        title: 'João Silva',
        subtitle: 'CPF: 123.456.789-00',
        route: '/pacientes'
      });
    }

    if (lowerQuery.includes('hemograma') || lowerQuery.includes('sangue')) {
      mockResults.push({
        id: '2',
        type: 'schema',
        title: 'Hemograma Completo',
        subtitle: 'Schema de exame de sangue',
        route: '/exames/schemas'
      });
    }

    if (lowerQuery.includes('maria')) {
      mockResults.push({
        id: '3',
        type: 'paciente',
        title: 'Maria Santos',
        subtitle: 'CPF: 987.654.321-00',
        route: '/pacientes'
      });
    }

    this.results.set(mockResults);
  }

  selectResult(result: SearchResult): void {
    this.saveRecentSearch(this.searchQuery());
    this.router.navigate([result.route]);
    this.close();
  }

  applyRecentSearch(query: string): void {
    this.searchQuery.set(query);
    this.onSearchChange();
  }

  getTypeName(type: string): string {
    const names: Record<string, string> = {
      'paciente': 'Paciente',
      'exame': 'Exame',
      'schema': 'Schema'
    };
    return names[type] || type;
  }

  private saveRecentSearch(query: string): void {
    if (!query.trim()) return;

    const recent: RecentSearch = {
      query: query.trim(),
      timestamp: Date.now()
    };

    const searches = this.recentSearches().filter(s => s.query !== query);
    searches.unshift(recent);

    // Manter apenas as 5 últimas
    const limited = searches.slice(0, 5);
    this.recentSearches.set(limited);

    // Salvar no localStorage
    localStorage.setItem('recentSearches', JSON.stringify(limited));
  }

  private loadRecentSearches(): void {
    try {
      const stored = localStorage.getItem('recentSearches');
      if (stored) {
        this.recentSearches.set(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Erro ao carregar buscas recentes:', error);
    }
  }
}
